#include "buttons_overlay_target.h"

#include <cmath>
#include <map>
#include <string>

#include "buttons_overlay.h"
#include "log.h"
#include "networkbasetypes.pb.h"
#include "networkstringtabledefs.h"
#include "player_controllers.h"
#include "player_slots.h"
#include "plugin.h"
#include "user_commands.h"

static INetworkStringTableContainer* stringTables = NULL;
// Entity index of the spectated player's controller, 0 when nobody is spectated.
static int overlayControllerEntityIndex = 0;
// Player slot the overlay shows the buttons of, -1 when there is none.
static int overlayPlayerSlot = -1;
static uint64_t overlaySteamId = 0;

constexpr float TICKS_PER_SECOND = 64.f;
// Demos don't carry the players' velocity, so the speed comes from how far the pawn moved over the last positions,
// read once per demo tick. They are read at a varying point of the interpolation between two ticks, which a span of
// several ticks averages out.
constexpr int SPEED_SAMPLE_COUNT = 17;
// Beyond this gap between two positions, the playback was seeked rather than played.
constexpr int MAX_SPEED_SAMPLE_GAP_TICKS = 32;
// Above sv_maxvelocity: a pawn covering more ground than this between two positions was teleported, by a respawn or a
// round restart for example.
constexpr float MAX_PLAYER_SPEED = 5000.f;

struct PositionSample {
    int tick;
    float x;
    float y;
};

static PositionSample speedSamples[SPEED_SAMPLE_COUNT];
static int speedSampleCount = 0;
static int newestSpeedSampleIndex = 0;
static float overlaySpeed = 0.f;

struct PlayerInfo {
    uint64_t steamId;
    std::string name;
};

static std::map<int, PlayerInfo> playerInfoByPlayerSlot;

// Returns the SteamID and name of the player in the given slot. They come from the "userinfo" string table, which has
// one entry per player slot holding a serialized CMsgPlayerInfo. Results are cached.
static const PlayerInfo* GetPlayerInfoForPlayerSlot(int playerSlot) {
    auto it = playerInfoByPlayerSlot.find(playerSlot);
    if (it != playerInfoByPlayerSlot.end()) {
        return &it->second;
    }

    if (stringTables == NULL) {
        if (factory == NULL) {
            return NULL;
        }

        stringTables = (INetworkStringTableContainer*)factory(INTERFACENAME_NETWORKSTRINGTABLECLIENT, NULL);
        if (stringTables == NULL) {
            Log("String table interface not found");
            return NULL;
        }
    }

    INetworkStringTable* userInfo = stringTables->FindTable("userinfo");
    if (userInfo == NULL || playerSlot >= userInfo->GetNumStrings()) {
        return NULL;
    }

    const StringUserData_t* userData = userInfo->GetStringUserData(playerSlot);
    if (userData == NULL || userData->m_pRawData == NULL || userData->m_cbDataSize == 0) {
        return NULL;
    }

    CMsgPlayerInfo message;
    if (!message.ParseFromArray(userData->m_pRawData, (int)userData->m_cbDataSize)) {
        return NULL;
    }

    PlayerInfo& playerInfo = playerInfoByPlayerSlot[playerSlot];
    playerInfo.steamId = message.xuid();
    playerInfo.name = message.name();

    return &playerInfo;
}

// A controller's entity index is its player slot plus one only as long as the game allocates them that way, so the
// slot is looked up by SteamID when there is one, and the entity index is the fallback.
static int FindPlayerSlot(uint64_t steamId, int fallbackPlayerSlot) {
    if (steamId != 0) {
        for (int playerSlot = 0; playerSlot < maxPlayerSlots; playerSlot++) {
            const PlayerInfo* playerInfo = GetPlayerInfoForPlayerSlot(playerSlot);
            if (playerInfo != NULL && playerInfo->steamId == steamId) {
                return playerSlot;
            }
        }
    }

    return fallbackPlayerSlot;
}

static void SetOverlaySpeed(float speed) {
    overlaySpeed = speed;
    SetButtonsOverlaySpeed(speed);
}

static void ResetSpeed() {
    speedSampleCount = 0;
    SetOverlaySpeed(0.f);
}

static float GetHorizontalDistance(const PositionSample& sample, const PositionSample& otherSample) {
    float deltaX = otherSample.x - sample.x;
    float deltaY = otherSample.y - sample.y;

    return sqrtf(deltaX * deltaX + deltaY * deltaY);
}

static void AddSpeedSample(const PositionSample& sample) {
    newestSpeedSampleIndex = (newestSpeedSampleIndex + 1) % SPEED_SAMPLE_COUNT;
    speedSamples[newestSpeedSampleIndex] = sample;
    if (speedSampleCount < SPEED_SAMPLE_COUNT) {
        speedSampleCount++;
    }
}

static void UpdateSpeed(int tick) {
    if (overlayControllerEntityIndex == 0) {
        return;
    }

    const PositionSample& newest = speedSamples[newestSpeedSampleIndex];
    // Paused, or more than one frame in the same tick: the pawn hasn't moved since the last position.
    if (speedSampleCount > 0 && tick == newest.tick) {
        return;
    }

    PawnPosition position;
    if (!GetPlayerPawnPosition(overlayControllerEntityIndex, overlaySteamId, &position)) {
        ResetSpeed();
        return;
    }

    PositionSample sample = {tick, position.x, position.y};
    if (speedSampleCount > 0) {
        int elapsedTicks = tick - newest.tick;
        if (elapsedTicks < 0 || elapsedTicks > MAX_SPEED_SAMPLE_GAP_TICKS ||
            GetHorizontalDistance(newest, sample) > MAX_PLAYER_SPEED * elapsedTicks / TICKS_PER_SECOND) {
            speedSampleCount = 0;
        }
    }

    AddSpeedSample(sample);
    if (speedSampleCount < 2) {
        return;
    }

    int oldestIndex = (newestSpeedSampleIndex - speedSampleCount + 1 + SPEED_SAMPLE_COUNT) % SPEED_SAMPLE_COUNT;
    const PositionSample& oldest = speedSamples[oldestIndex];
    float elapsedSeconds = (sample.tick - oldest.tick) / TICKS_PER_SECOND;
    SetOverlaySpeed(GetHorizontalDistance(oldest, sample) / elapsedSeconds);
}

void ResetButtonsOverlayTarget() {
    overlayControllerEntityIndex = 0;
    overlayPlayerSlot = -1;
    overlaySteamId = 0;
    // Player slots are reused across demos, so nothing known about the previous one can be kept.
    playerInfoByPlayerSlot.clear();
    SetButtonsOverlayPressedButtons(0);
    ResetSpeed();
}

static void UpdateTarget() {
    SpectatedPlayer spectated;
    bool isSpectatingSomeone = GetSpectatedPlayer(&spectated);
    int controllerEntityIndex = isSpectatingSomeone ? spectated.controllerEntityIndex : 0;
    uint64_t steamId = isSpectatingSomeone ? spectated.steamId : 0;
    if (controllerEntityIndex == overlayControllerEntityIndex && steamId == overlaySteamId) {
        return;
    }

    overlayControllerEntityIndex = controllerEntityIndex;
    overlaySteamId = steamId;

    int playerSlot = isSpectatingSomeone ? FindPlayerSlot(spectated.steamId, controllerEntityIndex - 1) : -1;
    overlayPlayerSlot = playerSlot;

    // A player's buttons are only sent when they change, so start from the last known state.
    SetButtonsOverlayPressedButtons(GetPlayerButtons(playerSlot));
    ResetSpeed();
}

void UpdateButtonsOverlayTarget(int tick) {
    if (!IsButtonsOverlayVisible()) {
        ResetSpeed();
        return;
    }

    UpdateTarget();
    UpdateSpeed(tick);
}

void OnPlayerButtonsChanged(int playerSlot, uint64_t buttons) {
    if (playerSlot == overlayPlayerSlot) {
        SetButtonsOverlayPressedButtons(buttons);
    }
}

void LogButtonsOverlayTargetState() {
    Log("Buttons overlay: %s, slot %d, speed %.0f", IsButtonsOverlayVisible() ? "shown" : "hidden", overlayPlayerSlot,
        overlaySpeed);
}
