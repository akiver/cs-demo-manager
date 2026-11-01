#include "player_controllers.h"

#include <cstring>

#include "entity2/entityidentity.h"
#include "entity_system.h"
#include "log.h"
#include "memory.h"
#include "schema.h"

#define PLAYER_CONTROLLER_DESIGNER_NAME "cs_player_controller"

// Resolving the spectated player walks the controllers with a syscall per step, too costly for every frame. It runs
// every few frames and the overlays read the cached result, so they keep showing the previous player for up to this
// many frames after a switch.
constexpr int SPECTATED_PLAYER_REFRESH_FRAMES = 8;
// Starts at the threshold so the first frame resolves the player.
static int framesSinceSpectatedPlayerRefresh = SPECTATED_PLAYER_REFRESH_FRAMES;
static bool isSpectatingSomeone = false;
static SpectatedPlayer spectatedPlayer = {};

// IsPlayerController validates the designer name pointer with IsReadableMemory (a syscall), and each refresh walks the
// controller slots several times. Designer names are interned strings that live as long as their entity, so the result
// is cached per slot and recomputed only when the slot's instance or name pointer changes.
struct PlayerControllerCacheEntry {
    const void* instance;
    const char* designerName;
    bool isPlayerController;
};

static PlayerControllerCacheEntry playerControllerCache[maxPlayerSlots + 1] = {};

static void ReadPlayerName(const CEntityIdentity* identity, char* name, size_t size);

static bool IsPlayerController(const CEntityIdentity* identity, int index) {
    const char* designerName = identity->GetClassname();
    PlayerControllerCacheEntry* cached = index >= 0 && index <= maxPlayerSlots ? &playerControllerCache[index] : NULL;
    if (cached != NULL && cached->instance == identity->m_pInstance && cached->designerName == designerName) {
        return cached->isPlayerController;
    }

    bool isPlayerController =
        IsReadableMemory(designerName, 1) && strcmp(designerName, PLAYER_CONTROLLER_DESIGNER_NAME) == 0;
    if (cached != NULL) {
        cached->instance = identity->m_pInstance;
        cached->designerName = designerName;
        cached->isPlayerController = isPlayerController;
    }

    return isPlayerController;
}

static bool ReadBool(const CEntityIdentity* identity, SchemaFieldId field) {
    int offset = GetSchemaOffset(field);

    return offset != -1 && *((const uint8_t*)identity->m_pInstance + offset) != 0;
}

static uint64_t ReadSteamId(const CEntityIdentity* identity) {
    int offset = GetSchemaOffset(FIELD_CONTROLLER_STEAM_ID);

    return offset != -1 ? *(const uint64_t*)((const uint8_t*)identity->m_pInstance + offset) : 0;
}

static CEntityHandle ReadHandle(const CEntityIdentity* identity, SchemaFieldId field) {
    int offset = GetSchemaOffset(field);

    return offset != -1 ? *(const CEntityHandle*)((const uint8_t*)identity->m_pInstance + offset) : CEntityHandle();
}

static bool HandlesMatch(const CEntityHandle& handle, const CEntityHandle& otherHandle) {
    return handle.IsValid() && otherHandle.IsValid() && handle.GetEntryIndex() == otherHandle.GetEntryIndex();
}

static CEntityIdentity* FindLocalPlayerController(uint8_t* entitySystem) {
    CEntityIdentity* hltvController = NULL;

    for (int index = 1; index <= maxPlayerSlots; index++) {
        CEntityIdentity* identity = GetEntityIdentity(entitySystem, index);
        if (identity == NULL || !IsPlayerController(identity, index)) {
            continue;
        }

        if (ReadBool(identity, FIELD_IS_LOCAL_PLAYER_CONTROLLER)) {
            return identity;
        }

        if (hltvController == NULL && ReadBool(identity, FIELD_IS_HLTV)) {
            hltvController = identity;
        }
    }

    // A GOTV demo is viewed through the GOTV client's controller, which the game doesn't necessarily flag as the local
    // one, so fall back to the HLTV controller.
    return hltvController;
}

// The observer target is a pawn. Its controller is found by matching the pawn handles of the controllers, without
// reading any field of the pawn, so an entity of an unexpected class is never dereferenced.
static CEntityIdentity* FindControllerOfPawn(uint8_t* entitySystem, const CEntityHandle& pawnHandle) {
    if (!pawnHandle.IsValid()) {
        return NULL;
    }

    // Spectating through the scoreboard targets the controller itself rather than the pawn it drives.
    int targetIndex = pawnHandle.GetEntryIndex();
    CEntityIdentity* target = GetEntityIdentity(entitySystem, targetIndex);
    if (target != NULL && IsPlayerController(target, targetIndex)) {
        return target;
    }

    for (int index = 1; index <= maxPlayerSlots; index++) {
        CEntityIdentity* identity = GetEntityIdentity(entitySystem, index);
        if (identity == NULL || !IsPlayerController(identity, index)) {
            continue;
        }

        if (HandlesMatch(ReadHandle(identity, FIELD_CONTROLLER_PAWN), pawnHandle) ||
            HandlesMatch(ReadHandle(identity, FIELD_CONTROLLER_PLAYER_PAWN), pawnHandle)) {
            return identity;
        }
    }

    return NULL;
}

// Returns the observer services of the pawn the camera is attached to, which hold the spectated player.
static void* GetObserverServices(uint8_t* entitySystem, const CEntityIdentity* localController) {
    const SchemaFieldId pawnFields[] = {FIELD_CONTROLLER_PAWN, FIELD_CONTROLLER_OBSERVER_PAWN};
    for (SchemaFieldId pawnField : pawnFields) {
        CEntityHandle pawnHandle = ReadHandle(localController, pawnField);
        if (!pawnHandle.IsValid()) {
            continue;
        }

        CEntityIdentity* pawn = GetEntityIdentity(entitySystem, pawnHandle.GetEntryIndex());
        if (pawn == NULL) {
            continue;
        }

        void** member = (void**)((uint8_t*)pawn->m_pInstance + GetSchemaOffset(FIELD_OBSERVER_SERVICES));
        if (!IsReadableMemory(member, sizeof(void*))) {
            continue;
        }

        uint8_t* observerServices = (uint8_t*)*member;
        if (!IsPlausiblePointer(observerServices) ||
            !IsReadableMemory(observerServices + GetSchemaOffset(FIELD_OBSERVER_TARGET), sizeof(CEntityHandle))) {
            continue;
        }

        return observerServices;
    }

    return NULL;
}

static bool ResolveSpectatedPlayer(SpectatedPlayer* spectated) {
    uint8_t* entitySystem = GetEntitySystem();
    if (entitySystem == NULL || !ResolveSchemaFields()) {
        return false;
    }

    CEntityIdentity* localController = FindLocalPlayerController(entitySystem);
    if (localController == NULL) {
        return false;
    }

    void* observerServices = GetObserverServices(entitySystem, localController);
    if (observerServices == NULL) {
        return false;
    }

    CEntityHandle targetHandle = *(CEntityHandle*)((uint8_t*)observerServices + GetSchemaOffset(FIELD_OBSERVER_TARGET));
    CEntityIdentity* controller = FindControllerOfPawn(entitySystem, targetHandle);
    if (controller == NULL) {
        return false;
    }

    spectated->steamId = ReadSteamId(controller);
    spectated->controllerEntityIndex = controller->GetEntityIndex().Get();
    ReadPlayerName(controller, spectated->name, sizeof(spectated->name));

    return true;
}

void RefreshSpectatedPlayer() {
    if (++framesSinceSpectatedPlayerRefresh < SPECTATED_PLAYER_REFRESH_FRAMES) {
        return;
    }
    framesSinceSpectatedPlayerRefresh = 0;

    isSpectatingSomeone = ResolveSpectatedPlayer(&spectatedPlayer);
}

bool GetSpectatedPlayer(SpectatedPlayer* spectated) {
    if (isSpectatingSomeone) {
        *spectated = spectatedPlayer;
    }

    return isSpectatingSomeone;
}

void ResetSpectatedPlayer() {
    framesSinceSpectatedPlayerRefresh = SPECTATED_PLAYER_REFRESH_FRAMES;
    isSpectatingSomeone = false;
}

static void ReadPlayerName(const CEntityIdentity* identity, char* name, size_t size) {
    int offset = GetSchemaOffset(FIELD_CONTROLLER_NAME);
    if (offset == -1) {
        name[0] = '\0';
        return;
    }

    const char* source = (const char*)identity->m_pInstance + offset;
    size_t length = strnlen(source, size - 1);
    memcpy(name, source, length);
    name[length] = '\0';
}

static SharedTeams_t ReadTeam(const CEntityIdentity* identity) {
    int offset = GetSchemaOffset(FIELD_TEAM_NUM);

    return offset != -1 ? (SharedTeams_t) * ((const uint8_t*)identity->m_pInstance + offset) : TEAM_INVALID;
}

static bool ReadIsAlive(const CEntityIdentity* identity) {
    int offset = GetSchemaOffset(FIELD_PAWN_IS_ALIVE);

    // A missing field counts as alive, so the players never all look dead after a game update.
    return offset == -1 || *((const uint8_t*)identity->m_pInstance + offset) != 0;
}

static CEntityIdentity* FindPlayerControllerInEntitySystem(uint8_t* entitySystem, int entityIndex, uint64_t steamId) {
    CEntityIdentity* identity = GetEntityIdentity(entitySystem, entityIndex);
    if (identity == NULL || !IsPlayerController(identity, entityIndex)) {
        return NULL;
    }

    return steamId == 0 || ReadSteamId(identity) == steamId ? identity : NULL;
}

CEntityIdentity* FindPlayerController(int entityIndex, uint64_t steamId) {
    uint8_t* entitySystem = GetEntitySystem();
    if (entitySystem == NULL || !ResolveSchemaFields()) {
        return NULL;
    }

    return FindPlayerControllerInEntitySystem(entitySystem, entityIndex, steamId);
}

static CEntityIdentity* FindPawnOfController(uint8_t* entitySystem, const CEntityIdentity* controller) {
    // m_hPawn moves to the observer pawn while the player is dead, m_hPlayerPawn keeps the player's own pawn.
    const SchemaFieldId pawnFields[] = {FIELD_CONTROLLER_PLAYER_PAWN, FIELD_CONTROLLER_PAWN};
    for (SchemaFieldId pawnField : pawnFields) {
        CEntityHandle pawnHandle = ReadHandle(controller, pawnField);
        if (!pawnHandle.IsValid()) {
            continue;
        }

        CEntityIdentity* pawn = GetEntityIdentity(entitySystem, pawnHandle.GetEntryIndex());
        if (pawn != NULL) {
            return pawn;
        }
    }

    return NULL;
}

bool GetPlayerPawnPosition(int controllerEntityIndex, uint64_t steamId, PawnPosition* position) {
    uint8_t* entitySystem = GetEntitySystem();
    if (entitySystem == NULL || !ResolveSchemaFields()) {
        return false;
    }

    int sceneNodeOffset = GetSchemaOffset(FIELD_GAME_SCENE_NODE);
    int originOffset = GetSchemaOffset(FIELD_SCENE_NODE_ABS_ORIGIN);
    if (sceneNodeOffset == -1 || originOffset == -1) {
        return false;
    }

    CEntityIdentity* controller = FindPlayerControllerInEntitySystem(entitySystem, controllerEntityIndex, steamId);
    if (controller == NULL) {
        return false;
    }

    CEntityIdentity* pawn = FindPawnOfController(entitySystem, controller);
    if (pawn == NULL) {
        return false;
    }

    uint8_t** member = (uint8_t**)((uint8_t*)pawn->m_pInstance + sceneNodeOffset);
    if (!IsReadableMemory(member, sizeof(void*))) {
        return false;
    }

    const uint8_t* sceneNode = *member;
    if (!IsPlausiblePointer(sceneNode)) {
        return false;
    }

    const float* origin = (const float*)(sceneNode + originOffset);
    if (!IsReadableMemory(origin, sizeof(float) * 3)) {
        return false;
    }

    position->x = origin[0];
    position->y = origin[1];
    position->z = origin[2];

    return true;
}

int ListPlayerControllers(PlayerController* controllers, int maxCount) {
    uint8_t* entitySystem = GetEntitySystem();
    if (entitySystem == NULL || !ResolveSchemaFields()) {
        return 0;
    }

    int count = 0;
    for (int index = 1; index <= maxPlayerSlots && count < maxCount; index++) {
        CEntityIdentity* identity = GetEntityIdentity(entitySystem, index);
        if (identity == NULL || !IsPlayerController(identity, index)) {
            continue;
        }

        PlayerController& controller = controllers[count++];
        controller.entityIndex = index;
        controller.steamId = ReadSteamId(identity);
        ReadPlayerName(identity, controller.name, sizeof(controller.name));
        controller.team = ReadTeam(identity);
        controller.isLocal = ReadBool(identity, FIELD_IS_LOCAL_PLAYER_CONTROLLER);
        controller.isHltv = ReadBool(identity, FIELD_IS_HLTV);
        controller.isAlive = ReadIsAlive(identity);
    }

    return count;
}

void LogPlayerControllersState() {
    uint8_t* entitySystem = GetEntitySystem();
    Log("Client entity system: %s", entitySystem != NULL ? "found" : "not found");
    if (entitySystem == NULL) {
        return;
    }

    LogEntitySystemState();

    if (!ResolveSchemaFields()) {
        Log("Schema fields not resolved");
        return;
    }

    LogSchemaFields();

    for (int index = 1; index <= maxPlayerSlots; index++) {
        CEntityIdentity* identity = GetEntityIdentity(entitySystem, index);
        if (identity == NULL || !IsPlayerController(identity, index)) {
            continue;
        }

        char name[playerNameSize];
        ReadPlayerName(identity, name, sizeof(name));
        Log("Controller %d: local %d, HLTV %d, pawn %d, SteamID %llu, team %d, alive %d, name %s", index,
            ReadBool(identity, FIELD_IS_LOCAL_PLAYER_CONTROLLER), ReadBool(identity, FIELD_IS_HLTV),
            ReadHandle(identity, FIELD_CONTROLLER_PAWN).GetEntryIndex(), (unsigned long long)ReadSteamId(identity),
            ReadTeam(identity), ReadIsAlive(identity), name);
    }

    CEntityIdentity* localController = FindLocalPlayerController(entitySystem);
    if (localController == NULL) {
        Log("No local player controller found");
        return;
    }

    void* observerServices = GetObserverServices(entitySystem, localController);
    if (observerServices == NULL) {
        Log("Local player controller %d has no observer services", localController->GetEntityIndex().Get());
        return;
    }

    const int observerModeOffset = GetSchemaOffset(FIELD_OBSERVER_MODE);
    const uint8_t* observerMode =
        observerModeOffset != -1 ? (const uint8_t*)observerServices + observerModeOffset : NULL;
    bool isObserverModeReadable = observerMode != NULL && IsReadableMemory(observerMode, 1);
    const CEntityHandle* targetHandle =
        (const CEntityHandle*)((uint8_t*)observerServices + GetSchemaOffset(FIELD_OBSERVER_TARGET));
    Log("Observer mode: %d, target: %d", isObserverModeReadable ? *observerMode : -1, targetHandle->GetEntryIndex());

    SpectatedPlayer spectated;
    if (ResolveSpectatedPlayer(&spectated)) {
        Log("Spectated player: SteamID %llu, controller %d, name %s", (unsigned long long)spectated.steamId,
            spectated.controllerEntityIndex, spectated.name);
    } else {
        Log("Spectated player: none");
    }
}
