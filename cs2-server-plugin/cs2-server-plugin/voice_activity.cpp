#include "voice_activity.h"

#include <map>

#include "log.h"
#include "player_slots.h"
#include "plugin.h"

// How long after their last packet a player still shows as talking, in demo ticks. Packets come every two to four
// ticks while someone speaks, so this bridges the gaps and still clears soon after they stop.
constexpr int TALKING_WINDOW_TICKS = 20;
// The first packets are logged to check in game which player fields they carry.
constexpr int LOGGED_PACKET_COUNT = 3;

static int lastPacketTickBySlot[maxPlayerSlots];
static std::map<uint64_t, int> lastPacketTickBySteamId;
static int packetCount = 0;
static bool isInitialized = false;

static void Initialize() {
    if (!isInitialized) {
        isInitialized = true;
        for (int slot = 0; slot < maxPlayerSlots; slot++) {
            lastPacketTickBySlot[slot] = -1;
        }
    }
}

void RecordVoicePacket(uint64_t steamId, int entityIndex) {
    Initialize();

    int tick = currentTick.load();
    if (steamId != 0) {
        lastPacketTickBySteamId[steamId] = tick;
    }

    int slot = entityIndex - 1;
    if (slot >= 0 && slot < maxPlayerSlots) {
        lastPacketTickBySlot[slot] = tick;
    }

    if (packetCount < LOGGED_PACKET_COUNT) {
        Log("Voice packet: SteamID %llu, entity %d, tick %d", (unsigned long long)steamId, entityIndex, tick);
    }
    packetCount++;
}

bool IsPlayerTalking(uint64_t steamId, int slot, int currentTick) {
    Initialize();

    int lastPacketTick = -1;
    if (steamId != 0) {
        auto it = lastPacketTickBySteamId.find(steamId);
        if (it != lastPacketTickBySteamId.end()) {
            lastPacketTick = it->second;
        }
    }
    if (slot >= 0 && slot < maxPlayerSlots && lastPacketTickBySlot[slot] > lastPacketTick) {
        lastPacketTick = lastPacketTickBySlot[slot];
    }

    if (lastPacketTick < 0) {
        return false;
    }

    int ticksSincePacket = currentTick - lastPacketTick;

    return ticksSincePacket >= 0 && ticksSincePacket <= TALKING_WINDOW_TICKS;
}

void ResetVoiceActivity() {
    isInitialized = false;
    Initialize();
    lastPacketTickBySteamId.clear();
    packetCount = 0;
}

void LogVoiceActivityState() {
    Initialize();

    Log("Voice packets: %d, tick %d", packetCount, currentTick.load());
    for (auto& entry : lastPacketTickBySteamId) {
        Log("  SteamID %llu last talked at tick %d", (unsigned long long)entry.first, entry.second);
    }
    for (int slot = 0; slot < maxPlayerSlots; slot++) {
        if (lastPacketTickBySlot[slot] >= 0) {
            Log("  Slot %d last talked at tick %d", slot, lastPacketTickBySlot[slot]);
        }
    }
}
