#include "player_voices.h"

#include <cstdio>
#include <cstdlib>
#include <cstring>

#include "convars.h"
#include "log.h"
#include "playback_overlay.h"
#include "player_controllers.h"
#include "plugin.h"
#include "string_utils.h"
#include "ui/playback_controls.h"
#include "voice_activity.h"
#include "voice_indicator.h"

#define LISTEN_VOICE_INDICES_CONVAR "tv_listen_voice_indices"
#define LISTEN_VOICE_INDICES_HIGH_CONVAR "tv_listen_voice_indices_h"

// Players rarely change during playback, walking the entities for them every frame would be wasted work.
constexpr int PLAYERS_REFRESH_FRAMES = 32;

static int framesSincePlayersRefresh = PLAYERS_REFRESH_FRAMES;
static PlaybackPlayer players[playbackMaxPlayers];
// SteamIDs of `players`, which voice packets identify players by.
static uint64_t playerSteamIds[playbackMaxPlayers];
static int playerCount = 0;
static bool hasLoggedMissingConVars = false;

static CachedConVar listenVoiceIndicesConVar = {LISTEN_VOICE_INDICES_CONVAR};
static CachedConVar listenVoiceIndicesHighConVar = {LISTEN_VOICE_INDICES_HIGH_CONVAR};

// The convars are signed ints (-1 for every player) and only their bits matter. Reading them as 64 bits keeps the low
// 32 bits right if they're ever declared unsigned.
static bool ReadConVarBits(CachedConVar& convar, uint32_t* bits) {
    int64_t value;
    if (!ReadConVarInt64(convar, &value)) {
        return false;
    }
    *bits = (uint32_t)value;

    return true;
}

static bool WriteConVarBits(CachedConVar& convar, uint32_t bits) { return WriteConVarInt(convar, (int32_t)bits); }

bool ReadListenVoiceMask(uint32_t* maskLow, uint32_t* maskHigh) {
    return ReadConVarBits(listenVoiceIndicesConVar, maskLow) && ReadConVarBits(listenVoiceIndicesHighConVar, maskHigh);
}

static void RefreshPlayers() {
    PlayerController controllers[maxPlayerSlots];
    int controllerCount = ListPlayerControllers(controllers, maxPlayerSlots);

    playerCount = 0;
    for (int i = 0; i < controllerCount && playerCount < playbackMaxPlayers; i++) {
        const PlayerController& controller = controllers[i];
        if (controller.isHltv || controller.steamId == 0) {
            continue;
        }

        int slot = controller.entityIndex - 1;
        if (slot < 0 || slot >= maxPlayerSlots) {
            continue;
        }

        playerSteamIds[playerCount] = controller.steamId;
        PlaybackPlayer& player = players[playerCount++];
        player.slot = slot;
        player.team = controller.team;
        player.isAlive = controller.isAlive;
        if (controller.name[0] != '\0') {
            CopyUtf8Truncated(player.name, controller.name);
        } else {
            snprintf(player.name, sizeof(player.name), "Player %d", slot + 1);
        }
    }
}

static void UpdateTalkingPlayers(uint32_t maskLow, uint32_t maskHigh) {
    VoiceIndicatorPlayer talkingPlayers[voiceIndicatorMaxPlayers];
    int talkingPlayerCount = 0;
    int tick = currentTick.load();
    for (int i = 0; i < playerCount && talkingPlayerCount < voiceIndicatorMaxPlayers; i++) {
        const PlaybackPlayer& player = players[i];
        if (!IsPlayerTalking(playerSteamIds[i], player.slot, tick)) {
            continue;
        }

        VoiceIndicatorPlayer& talkingPlayer = talkingPlayers[talkingPlayerCount++];
        memcpy(talkingPlayer.name, player.name, sizeof(talkingPlayer.name));
        talkingPlayer.team = player.team;
        talkingPlayer.isMuted = !IsVoiceSlotEnabled(maskLow, maskHigh, player.slot);
    }

    SetVoiceIndicatorState(talkingPlayers, talkingPlayerCount);
}

void UpdatePlayerVoicesState() {
    bool isPanelVisible = IsPlaybackPanelVisible();
    bool isIndicatorVisible = IsVoiceIndicatorVisible();
    if (!isPanelVisible && !isIndicatorVisible) {
        // Refresh the players as soon as the panel is shown again.
        framesSincePlayersRefresh = PLAYERS_REFRESH_FRAMES;
        return;
    }

    // Without the convars every player is treated as heard, which only costs the menu its checkboxes.
    uint32_t maskLow = UINT32_MAX;
    uint32_t maskHigh = UINT32_MAX;
    if (!ReadListenVoiceMask(&maskLow, &maskHigh) && !hasLoggedMissingConVars) {
        hasLoggedMissingConVars = true;
        Log("Player voices: the %s/%s convars can't be read, the voice menu won't work", LISTEN_VOICE_INDICES_CONVAR,
            LISTEN_VOICE_INDICES_HIGH_CONVAR);
    }

    if (++framesSincePlayersRefresh >= PLAYERS_REFRESH_FRAMES) {
        framesSincePlayersRefresh = 0;
        RefreshPlayers();
    }

    if (isPanelVisible) {
        SetPlaybackVoiceState(maskLow, maskHigh, players, playerCount);
    }

    if (isIndicatorVisible) {
        UpdateTalkingPlayers(maskLow, maskHigh);
    }
}

void ResetPlayerVoicesState() {
    playerCount = 0;
    framesSincePlayersRefresh = PLAYERS_REFRESH_FRAMES;

    uint32_t maskLow = 0;
    uint32_t maskHigh = 0;
    ReadListenVoiceMask(&maskLow, &maskHigh);
    SetPlaybackVoiceState(maskLow, maskHigh, players, 0);
    SetVoiceIndicatorState(NULL, 0);
}

void SetListenVoiceMask(uint32_t maskLow, uint32_t maskHigh) {
    char command[64];
    snprintf(command, sizeof(command), "%s %d", LISTEN_VOICE_INDICES_CONVAR, (int32_t)maskLow);
    QueueEngineCommand(command);
    snprintf(command, sizeof(command), "%s %d", LISTEN_VOICE_INDICES_HIGH_CONVAR, (int32_t)maskHigh);
    QueueEngineCommand(command);
}

static bool ResolveVoiceTarget(const char* target, const PlayerController* controllers, int controllerCount,
                               uint32_t* bitsLow, uint32_t* bitsHigh) {
    *bitsLow = 0;
    *bitsHigh = 0;
    if (EqualsNoCase(target, "all")) {
        *bitsLow = UINT32_MAX;
        *bitsHigh = UINT32_MAX;
        return true;
    }

    bool isTeam = EqualsNoCase(target, "ct") || EqualsNoCase(target, "t") || EqualsNoCase(target, "others");
    SharedTeams_t team = EqualsNoCase(target, "ct") ? CS_TEAM_CT : CS_TEAM_T;
    bool isOthers = EqualsNoCase(target, "others");
    bool isDigits = IsDigits(target);
    // A SteamID64 has 17 digits, a slot at most 2.
    bool isSteamId = isDigits && strlen(target) > 2;
    int slot = isDigits && !isSteamId ? atoi(target) : -1;
    if (slot >= maxPlayerSlots) {
        Log("Player slot %d is out of range, the last one is %d", slot, maxPlayerSlots - 1);
        return false;
    }

    if (slot >= 0) {
        GetVoiceSlotBit(slot, bitsLow, bitsHigh);
        return true;
    }

    uint64_t steamId = isSteamId ? strtoull(target, NULL, 10) : 0;
    int matchCount = 0;
    for (int i = 0; i < controllerCount; i++) {
        const PlayerController& controller = controllers[i];
        if (controller.isHltv || controller.steamId == 0) {
            continue;
        }

        bool matches;
        if (isTeam) {
            matches =
                isOthers ? controller.team != CS_TEAM_CT && controller.team != CS_TEAM_T : controller.team == team;
        } else if (isSteamId) {
            matches = controller.steamId == steamId;
        } else {
            matches = StartsWithNoCase(controller.name, target);
        }

        if (!matches) {
            continue;
        }

        int controllerSlot = controller.entityIndex - 1;
        if (controllerSlot < 0 || controllerSlot >= maxPlayerSlots) {
            continue;
        }

        uint32_t bitLow;
        uint32_t bitHigh;
        GetVoiceSlotBit(controllerSlot, &bitLow, &bitHigh);
        *bitsLow |= bitLow;
        *bitsHigh |= bitHigh;
        matchCount++;
    }

    if (matchCount == 0) {
        Log("No player matches \"%s\", use csdm_players to list them", target);
        return false;
    }

    return true;
}

void SetPlayerVoicesMuted(int targetCount, const char** targets, bool muted) {
    uint32_t maskLow;
    uint32_t maskHigh;
    if (!ReadListenVoiceMask(&maskLow, &maskHigh)) {
        Log("The %s/%s convars can't be read", LISTEN_VOICE_INDICES_CONVAR, LISTEN_VOICE_INDICES_HIGH_CONVAR);
        return;
    }

    PlayerController controllers[maxPlayerSlots];
    int controllerCount = ListPlayerControllers(controllers, maxPlayerSlots);
    uint32_t bitsLow = 0;
    uint32_t bitsHigh = 0;
    for (int i = 0; i < targetCount; i++) {
        uint32_t targetLow;
        uint32_t targetHigh;
        if (!ResolveVoiceTarget(targets[i], controllers, controllerCount, &targetLow, &targetHigh)) {
            return;
        }

        bitsLow |= targetLow;
        bitsHigh |= targetHigh;
    }

    if (muted) {
        maskLow &= ~bitsLow;
        maskHigh &= ~bitsHigh;
    } else {
        maskLow |= bitsLow;
        maskHigh |= bitsHigh;
    }

    if (!WriteConVarBits(listenVoiceIndicesConVar, maskLow) ||
        !WriteConVarBits(listenVoiceIndicesHighConVar, maskHigh)) {
        Log("The %s/%s convars can't be written", LISTEN_VOICE_INDICES_CONVAR, LISTEN_VOICE_INDICES_HIGH_CONVAR);
        return;
    }

    int heardCount = 0;
    for (int i = 0; i < controllerCount; i++) {
        const PlayerController& controller = controllers[i];
        if (controller.isHltv || controller.steamId == 0) {
            continue;
        }

        if (IsVoiceSlotEnabled(maskLow, maskHigh, controller.entityIndex - 1)) {
            heardCount++;
        }
    }
    Log("%s %d target%s, %d player%s heard", muted ? "Muted" : "Unmuted", targetCount, targetCount > 1 ? "s" : "",
        heardCount, heardCount != 1 ? "s" : "");
}
