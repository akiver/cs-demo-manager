#include "player_names.h"

#include <cstdlib>
#include <cstring>

#include "entity2/entityidentity.h"
#include "log.h"
#include "memory.h"
#include "player_controllers.h"
#include "player_slots.h"
#include "schema.h"
#include "string_utils.h"
#include "tier0/utlstring.h"

static bool hasLoggedSanitizedNameFailure = false;
static bool hasLoggedNameDirtyFailure = false;

enum NameWriteResult {
    NAME_WRITE_FAILED,
    NAME_WRITE_UNCHANGED,
    NAME_WRITE_CHANGED,
};

static void MarkPlayerNameDirty(const CEntityIdentity* identity) {
    int offset = GetSchemaOffset(FIELD_CONTROLLER_NAME_DIRTY);
    if (offset == -1) {
        if (!hasLoggedNameDirtyFailure) {
            hasLoggedNameDirtyFailure = true;
            Log("%s::%s is missing, the UI will show a replaced name only once the game touches the player on its own",
                GetSchemaClassName(FIELD_CONTROLLER_NAME_DIRTY), GetSchemaFieldName(FIELD_CONTROLLER_NAME_DIRTY));
        }
        return;
    }

    uint8_t* isNameDirty = (uint8_t*)identity->m_pInstance + offset;
    if (!IsReadableMemory(isNameDirty, sizeof(*isNameDirty))) {
        return;
    }

    *isNameDirty = 1;
}

static void WriteSanitizedPlayerName(const CEntityIdentity* identity, const char* name) {
    int offset = GetSchemaOffset(FIELD_CONTROLLER_SANITIZED_NAME);
    if (offset == -1 || !IsUtlStringField(FIELD_CONTROLLER_SANITIZED_NAME)) {
        if (!hasLoggedSanitizedNameFailure) {
            hasLoggedSanitizedNameFailure = true;
            Log("%s::%s is %s, the UI will keep showing the demo's name",
                GetSchemaClassName(FIELD_CONTROLLER_SANITIZED_NAME),
                GetSchemaFieldName(FIELD_CONTROLLER_SANITIZED_NAME),
                offset == -1 ? "missing" : "not a CUtlString anymore");
        }
        return;
    }

    CUtlString* sanitizedName = (CUtlString*)((uint8_t*)identity->m_pInstance + offset);
    if (!IsReadableMemory(sanitizedName, sizeof(CUtlString))) {
        return;
    }

    const char* currentName = sanitizedName->Get();
    if (!IsReadableMemory(currentName, 1) || strcmp(currentName, name) == 0) {
        return;
    }

    // Set frees the string the game allocated and allocates the new one.
    sanitizedName->Set(name);
}

static NameWriteResult WriteRawPlayerName(const CEntityIdentity* identity, const char* name) {
    int offset = GetSchemaOffset(FIELD_CONTROLLER_NAME);
    int capacity = GetSchemaSize(FIELD_CONTROLLER_NAME);
    if (offset == -1 || capacity <= 0) {
        return NAME_WRITE_FAILED;
    }

    char* destination = (char*)identity->m_pInstance + offset;
    if (!IsReadableMemory(destination, capacity)) {
        return NAME_WRITE_FAILED;
    }

    size_t length = Utf8TruncatedLength(name, (size_t)capacity);
    if (strncmp(destination, name, length) == 0 && destination[length] == '\0') {
        return NAME_WRITE_UNCHANGED;
    }

    memcpy(destination, name, length);
    destination[length] = '\0';

    return NAME_WRITE_CHANGED;
}

static bool WritePlayerName(int entityIndex, uint64_t steamId, const char* name) {
    CEntityIdentity* identity = FindPlayerController(entityIndex, steamId);
    if (identity == NULL) {
        return false;
    }

    // The raw name is the networked one, the only name the demo itself sets and what the plugin reads back.
    NameWriteResult result = WriteRawPlayerName(identity, name);
    if (result == NAME_WRITE_CHANGED) {
        // When the client applies a name change from the demo, it fills the sanitized name the UI shows and marks the
        // name dirty so the UI reads it again. It doesn't notice this write, so they are done here too.
        WriteSanitizedPlayerName(identity, name);
        MarkPlayerNameDirty(identity);
    }

    return result != NAME_WRITE_FAILED;
}

struct ReplacedPlayerName {
    int controllerEntityIndex;
    // The player the replacement was set for. Controllers are reused, so a slot handed to someone else keeps the name
    // the demo gives it.
    uint64_t steamId;
    // The name the demo gives the player, put back when the replacement is dropped.
    char originalName[playerNameSize];
    char name[playerNameSize];
};

// A player controller holds at most one replacement, and there is one controller per player slot.
static ReplacedPlayerName replacedNames[maxPlayerSlots];
static int replacedNameCount = 0;
// Frames the replacements have been written back on, reported by csdm_info: a name that goes back to the demo's one
// while this doesn't move means the frame stage the write hangs off isn't reached anymore.
static int appliedFrameCount = 0;

static ReplacedPlayerName* FindReplacedName(int controllerEntityIndex) {
    for (int i = 0; i < replacedNameCount; i++) {
        if (replacedNames[i].controllerEntityIndex == controllerEntityIndex) {
            return &replacedNames[i];
        }
    }

    return NULL;
}

static void RemoveReplacedName(ReplacedPlayerName* replaced) {
    for (int i = (int)(replaced - replacedNames); i < replacedNameCount - 1; i++) {
        replacedNames[i] = replacedNames[i + 1];
    }

    replacedNameCount--;
}

// The player `target` names, NULL when none or several match, which is logged. A name is matched against the one the
// controller holds and against the demo's name of a replaced player, so a player can be targeted by either.
static const PlayerController* FindTargetController(const char* target, const PlayerController* controllers,
                                                    int controllerCount) {
    bool isDigits = IsDigits(target);
    // A SteamID64 has 17 digits, a slot at most 2.
    bool isSteamId = isDigits && strlen(target) > 2;
    int slot = isDigits && !isSteamId ? atoi(target) : -1;
    if (slot >= maxPlayerSlots) {
        Log("Player slot %d is out of range, the last one is %d", slot, maxPlayerSlots - 1);
        return NULL;
    }

    uint64_t steamId = isSteamId ? strtoull(target, NULL, 10) : 0;
    const PlayerController* match = NULL;
    int matchCount = 0;
    for (int i = 0; i < controllerCount; i++) {
        const PlayerController& controller = controllers[i];
        if (controller.isHltv || controller.steamId == 0) {
            continue;
        }

        bool matches;
        if (slot >= 0) {
            matches = controller.entityIndex - 1 == slot;
        } else if (isSteamId) {
            matches = controller.steamId == steamId;
        } else {
            const ReplacedPlayerName* replaced = FindReplacedName(controller.entityIndex);
            matches = StartsWithNoCase(controller.name, target) ||
                      (replaced != NULL && StartsWithNoCase(replaced->originalName, target));
        }

        if (matches) {
            match = &controller;
            matchCount++;
        }
    }

    if (matchCount == 0) {
        Log("No player matches \"%s\", use csdm_players to list them", target);
        return NULL;
    }

    if (matchCount > 1) {
        Log("%d players match \"%s\", use their slot or their SteamID to tell them apart", matchCount, target);
        return NULL;
    }

    return match;
}

void ReplacePlayerName(const char* target, const char* name) {
    if (name != NULL && name[0] == '\0') {
        Log("The name can't be empty, call csdm_replace_player_name without a name to bring the demo's name back");
        return;
    }

    PlayerController controllers[maxPlayerSlots];
    int controllerCount = ListPlayerControllers(controllers, maxPlayerSlots);
    const PlayerController* controller = FindTargetController(target, controllers, controllerCount);
    if (controller == NULL) {
        return;
    }

    ReplacedPlayerName* replaced = FindReplacedName(controller->entityIndex);
    if (name == NULL) {
        if (replaced == NULL) {
            Log("The name of \"%s\" isn't replaced", controller->name);
            return;
        }

        if (!WritePlayerName(replaced->controllerEntityIndex, replaced->steamId, replaced->originalName)) {
            Log("The name of \"%s\" can't be written, try again", replaced->name);
            return;
        }

        Log("\"%s\" is shown as \"%s\" again", replaced->name, replaced->originalName);
        RemoveReplacedName(replaced);
        return;
    }

    if (replaced == NULL && replacedNameCount >= maxPlayerSlots) {
        Log("The names of %d players are already replaced", replacedNameCount);
        return;
    }

    // Built aside and only kept once the name is in the controller, so a failed write leaves the player as it was.
    ReplacedPlayerName entry;
    entry.controllerEntityIndex = controller->entityIndex;
    entry.steamId = controller->steamId;
    // Replacing the name of an already replaced player keeps the name the demo gives it, the one in the controller is
    // the previous replacement.
    CopyUtf8Truncated(entry.originalName, replaced != NULL ? replaced->originalName : controller->name);
    CopyUtf8Truncated(entry.name, name);

    if (!WritePlayerName(entry.controllerEntityIndex, entry.steamId, entry.name)) {
        Log("The name of \"%s\" can't be written, try again", entry.originalName);
        return;
    }

    if (replaced == NULL) {
        replaced = &replacedNames[replacedNameCount++];
    }
    *replaced = entry;

    Log("\"%s\" is now shown as \"%s\"", entry.originalName, entry.name);
}

void ApplyReplacedPlayerNames() {
    if (replacedNameCount == 0) {
        return;
    }

    appliedFrameCount++;
    for (int i = 0; i < replacedNameCount; i++) {
        const ReplacedPlayerName& replaced = replacedNames[i];
        WritePlayerName(replaced.controllerEntityIndex, replaced.steamId, replaced.name);
    }
}

void ResetReplacedPlayerNames() {
    replacedNameCount = 0;
    appliedFrameCount = 0;
}

void LogReplacedPlayerNamesState() {
    if (replacedNameCount == 0) {
        Log("No replaced player name");
        return;
    }

    Log("Replaced names applied on %d frames", appliedFrameCount);
    for (int i = 0; i < replacedNameCount; i++) {
        const ReplacedPlayerName& replaced = replacedNames[i];
        Log("Replaced name: slot %d, SteamID %llu, \"%s\" shown as \"%s\"", replaced.controllerEntityIndex - 1,
            (unsigned long long)replaced.steamId, replaced.originalName, replaced.name);
    }
}
