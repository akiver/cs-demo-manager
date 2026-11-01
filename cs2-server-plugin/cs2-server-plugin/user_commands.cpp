#include "user_commands.h"

#include <cstdint>
#include <map>
#include <string>

#include "buttons_overlay_target.h"
#include "cs_usercmd.pb.h"
#include "in_buttons.h"
#include "log.h"
#include "netmessages.pb.h"

static std::map<int, uint64_t> buttonsByPlayerSlot;

// Minimal protobuf wire format reader for delta_data, which ParseFromString can't read (see wireTypeReset).
struct ProtoReader {
    const uint8_t* current;
    const uint8_t* end;
};

// Field numbers from the root of a CSGOUserCmdPB down to the button mask:
// CSGOUserCmdPB.base (1) -> CBaseUserCmdPB.buttons_pb (3) -> CInButtonStatePB.buttonstate1 (1)
constexpr uint32_t buttonsPath[] = {1, 3, 1};
constexpr int buttonsPathLength = 3;

// Valve's codegen_delta_encoder marks "reset this field to its default" with wire type 7, which is invalid in
// standard protobuf.
constexpr uint32_t wireTypeReset = 7;

struct ButtonBit {
    uint64_t bit;
    const char* name;
};

constexpr ButtonBit buttonBits[] = {
    {IN_ATTACK, "ATTACK"},
    {IN_JUMP, "JUMP"},
    {IN_DUCK, "DUCK"},
    {IN_FORWARD, "FORWARD"},
    {IN_BACK, "BACK"},
    {IN_USE, "USE"},
    {IN_TURNLEFT, "TURNLEFT"},
    {IN_TURNRIGHT, "TURNRIGHT"},
    {IN_MOVELEFT, "MOVELEFT"},
    {IN_MOVERIGHT, "MOVERIGHT"},
    {IN_ATTACK2, "ATTACK2"},
    {IN_RELOAD, "RELOAD"},
    {IN_SPEED, "SPEED"},
    {IN_JOYAUTOSPRINT, "JOYAUTOSPRINT"},
    {IN_USEORRELOAD, "USEORRELOAD"},
    {IN_SCORE, "SCORE"},
    {IN_ZOOM, "ZOOM"},
    {IN_LOOK_AT_WEAPON, "LOOKATWEAPON"},
};

static bool ReadVarint(ProtoReader& reader, uint64_t* value) {
    uint64_t result = 0;
    int shift = 0;
    while (reader.current < reader.end) {
        uint8_t byte = *reader.current++;
        result |= (uint64_t)(byte & 0x7F) << shift;
        if ((byte & 0x80) == 0) {
            *value = result;
            return true;
        }

        shift += 7;
        if (shift > 63) {
            return false;
        }
    }

    return false;
}

static bool ReadLengthDelimited(ProtoReader& reader, const uint8_t** data, size_t* size) {
    uint64_t length;
    if (!ReadVarint(reader, &length) || length > (uint64_t)(reader.end - reader.current)) {
        return false;
    }

    *data = reader.current;
    *size = (size_t)length;
    reader.current += length;

    return true;
}

static bool SkipField(ProtoReader& reader, uint32_t wireType) {
    uint64_t ignored;
    const uint8_t* data;
    size_t size;

    switch (wireType) {
        case 0:
            return ReadVarint(reader, &ignored);
        case 1:
            reader.current += 8;
            return reader.current <= reader.end;
        case 2:
            return ReadLengthDelimited(reader, &data, &size);
        case 5:
            reader.current += 4;
            return reader.current <= reader.end;
        default:
            return false;
    }
}

// Walks a full CSGOUserCmdPB snapshot or a delta blob and merges buttonstate1 into buttons, skipping every other
// field without decoding it. Deltas leave buttons untouched when the path is absent, and zero it on a reset marker
// anywhere along the path.
static bool MergeUserCmdButtons(const uint8_t* data, size_t size, int level, uint64_t* buttons) {
    ProtoReader reader = {data, data + size};
    uint32_t target = buttonsPath[level];

    while (reader.current < reader.end) {
        uint64_t tag;
        if (!ReadVarint(reader, &tag)) {
            return false;
        }

        uint32_t fieldNumber = (uint32_t)(tag >> 3);
        uint32_t wireType = (uint32_t)(tag & 7);

        if (wireType == wireTypeReset) {
            if (fieldNumber == target) {
                *buttons = 0;
            }
            continue;
        }

        if (fieldNumber != target) {
            if (!SkipField(reader, wireType)) {
                return false;
            }
            continue;
        }

        if (level == buttonsPathLength - 1) {
            if (wireType != 0 || !ReadVarint(reader, buttons)) {
                return false;
            }
            continue;
        }

        if (wireType != 2) {
            return false;
        }

        const uint8_t* nested;
        size_t nestedSize;
        if (!ReadLengthDelimited(reader, &nested, &nestedSize)) {
            return false;
        }

        if (!MergeUserCmdButtons(nested, nestedSize, level + 1, buttons)) {
            return false;
        }
    }

    return true;
}

static std::string ButtonsToString(uint64_t buttons) {
    std::string result;
    for (auto& button : buttonBits) {
        if (buttons & button.bit) {
            if (!result.empty()) {
                result += "+";
            }
            result += button.name;
        }
    }

    return result.empty() ? "none" : result;
}

static void HandleUserCommand(const CMsgServerUserCmd& command) {
    // User commands are delta encoded. Only some carry a full snapshot, the others carry in delta_data the fields that
    // changed since the previous command of that slot.
    int playerSlot = command.player_slot();
    uint64_t buttons = 0;
    auto it = buttonsByPlayerSlot.find(playerSlot);
    bool hasBaseline = it != buttonsByPlayerSlot.end();

    if (command.has_data()) {
        CSGOUserCmdPB userCmd;
        if (!userCmd.ParseFromString(command.data())) {
            buttonsByPlayerSlot.erase(playerSlot);
            return;
        }

        buttons = userCmd.base().buttons_pb().buttonstate1();
    } else if (command.has_delta_data()) {
        // A delta means nothing without a snapshot to apply it to.
        if (!hasBaseline) {
            return;
        }

        // delta_data uses Valve's codegen_delta_encoder format, which ParseFromString can't read.
        buttons = it->second;
        const std::string& delta = command.delta_data();
        if (!MergeUserCmdButtons((const uint8_t*)delta.data(), delta.size(), 0, &buttons)) {
            // Forget the slot until the next snapshot gives a fresh baseline.
            buttonsByPlayerSlot.erase(it);
            return;
        }
    } else {
        return;
    }

    bool changed = !hasBaseline || it->second != buttons;
    buttonsByPlayerSlot[playerSlot] = buttons;

    if (changed) {
        OnPlayerButtonsChanged(playerSlot, buttons);
    }
}

void HandleUserCommandsMessage(const CSVCMsg_UserCommands& message) {
    for (int i = 0; i < message.commands_size(); i++) {
        HandleUserCommand(message.commands(i));
    }
}

uint64_t GetPlayerButtons(int playerSlot) {
    auto it = buttonsByPlayerSlot.find(playerSlot);

    return it != buttonsByPlayerSlot.end() ? it->second : 0;
}

void ResetUserCommandsState() {
    // Player slots are reused across demos, so nothing known about the previous one can be kept.
    buttonsByPlayerSlot.clear();
}

void LogUserCommandsState() {
    for (auto& entry : buttonsByPlayerSlot) {
        Log("Slot %d buttons: %#llx %s", entry.first, (unsigned long long)entry.second,
            ButtonsToString(entry.second).c_str());
    }
}
