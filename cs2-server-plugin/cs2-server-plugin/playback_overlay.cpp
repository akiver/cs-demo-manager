#include "playback_overlay.h"

#include <atomic>
#include <cstddef>
#include <cstdio>
#include <cstring>
#include <mutex>
#include <string>

#include "buttons_overlay.h"
#include "convars.h"
#include "log.h"
#include "playback_cameras.h"
#include "playback_overlay_state.h"
#include "player_controllers.h"
#include "player_voices.h"
#include "plugin.h"
#include "voice_indicator.h"

std::atomic<bool> isPlaybackPanelVisible{false};
std::atomic<int> playbackTick{0};
std::atomic<int> playbackTotalTicks{0};
std::atomic<float> playbackSpeed{1.f};
std::atomic<bool> isXrayEnabled{true};
std::atomic<bool> isPlaybackPaused{false};
std::atomic<bool> isMatchTimelineVisible{true};
std::atomic<bool> isRoundTimelineVisible{true};
std::atomic<bool> isRoundTimelineSpectatedOnly{false};
std::atomic<bool> isFollowKillerEnabled{false};
std::atomic<float> autoHideDelay{playbackPanelDefaultAutoHideDelay};
std::atomic<int> skipSeconds{playbackDefaultSkipSeconds};
std::atomic<int> loopStartTick{-1};
std::atomic<int> loopEndTick{-1};

std::mutex demoPathMutex;
std::string playbackDemoPath;
std::string playbackDemoChecksum;

std::atomic<uint32_t> voiceMaskLow{0};
std::atomic<uint32_t> voiceMaskHigh{0};
std::mutex playbackPlayersMutex;
PlaybackPlayer playbackPlayers[playbackMaxPlayers];
int playbackPlayerCount = 0;

std::mutex timelineMutex;
PlaybackTimeline playbackTimeline = {};

std::atomic<uint64_t> spectatedSteamId{0};
std::atomic<int> spectatedSlot{-1};
std::mutex spectatedPlayerMutex;
char spectatedPlayerName[playerNameSize] = "";

static void LogTick(const char* prefix, int tick) {
    int seconds = tick / playbackTickrate;
    Log("%s %d:%02d (tick %d)", prefix, seconds / 60, seconds % 60, tick);
}

static CachedConVar xrayConVar = {"spec_show_xray"};

bool ReadXrayEnabled() {
    bool isEnabled = true;
    ReadConVarBool(xrayConVar, &isEnabled);

    return isEnabled;
}

void LogPlaybackRoundClockState() {
    std::lock_guard<std::mutex> lock(timelineMutex);
    Log("Round time from the timeline file: %d s", playbackTimeline.roundDurationSeconds);
}

bool IsPlaybackPanelVisible() { return isPlaybackPanelVisible; }

void SetPlaybackMatchTimelineVisible(bool visible) {
    isMatchTimelineVisible = visible;
    PushPanelState();
}

bool IsPlaybackMatchTimelineVisible() { return isMatchTimelineVisible; }

void SetPlaybackRoundTimelineVisible(bool visible) {
    isRoundTimelineVisible = visible;
    PushPanelState();
}

bool IsPlaybackRoundTimelineVisible() { return isRoundTimelineVisible; }

void SetPlaybackRoundTimelineSpectatedOnly(bool isSpectatedOnly) {
    isRoundTimelineSpectatedOnly = isSpectatedOnly;
    PushPanelState();
}

bool IsPlaybackRoundTimelineSpectatedOnly() { return isRoundTimelineSpectatedOnly; }

void SetPlaybackFollowKillerEnabled(bool isEnabled) {
    isFollowKillerEnabled = isEnabled;
    PushPanelState();
}

bool IsPlaybackFollowKillerEnabled() { return isFollowKillerEnabled; }

void SetPlaybackLoopStart(int tick) {
    if (tick < 0) {
        tick = 0;
    }
    // A start at or past the end means the loop is being set anew.
    int end = loopEndTick;
    if (end >= 0 && end <= tick) {
        loopEndTick = -1;
    }
    loopStartTick = tick;
    LogTick("Loop start set at", tick);
    PushPanelState();
}

void SetPlaybackLoopEnd(int tick) {
    int start = loopStartTick;
    if (start < 0) {
        SetPlaybackLoopStart(tick);
        return;
    }
    if (tick == start) {
        LogTick("Loop end ignored, it is the start:", tick);
        return;
    }

    if (tick < start) {
        loopStartTick = tick;
        loopEndTick = start;
    } else {
        loopEndTick = tick;
    }
    LogTick("Loop start at", loopStartTick);
    LogTick("Loop end at", loopEndTick);
    PushPanelState();
}

bool SetPlaybackLoop(int startTick, int endTick) {
    if (!isPlaybackActive || startTick == endTick) {
        return false;
    }

    SetPlaybackLoopStart(startTick < endTick ? startTick : endTick);
    SetPlaybackLoopEnd(startTick < endTick ? endTick : startTick);

    return true;
}

void ClearPlaybackLoop() {
    if (loopStartTick < 0 && loopEndTick < 0) {
        return;
    }

    loopStartTick = -1;
    loopEndTick = -1;
    Log("Loop cleared");
    PushPanelState();
}

void GetPlaybackLoop(int* startTick, int* endTick) {
    *startTick = loopStartTick;
    *endTick = loopEndTick;
}

void SetPlaybackPanelAutoHideDelay(float seconds) {
    autoHideDelay = seconds < 0.f ? 0.f : seconds;
    PushPanelState();
}

float GetPlaybackPanelAutoHideDelay() { return autoHideDelay; }

void SetPlaybackSkipSeconds(int seconds) {
    skipSeconds = seconds < playbackMinSkipSeconds   ? playbackMinSkipSeconds
                  : seconds > playbackMaxSkipSeconds ? playbackMaxSkipSeconds
                                                     : seconds;
    PushPanelState();
}

int GetPlaybackSkipSeconds() { return skipSeconds; }

void SetPlaybackTimeline(const PlaybackTimeline& timeline) {
    {
        std::lock_guard<std::mutex> lock(timelineMutex);
        playbackTimeline = timeline;
    }
    PushTimeline();
}

void SetPlaybackDemoChecksum(const std::string& checksum) {
    std::lock_guard<std::mutex> lock(demoPathMutex);
    playbackDemoChecksum = checksum;
}

void SetPlaybackDemoPath(const std::string& path) {
    std::lock_guard<std::mutex> lock(demoPathMutex);
    playbackDemoPath = path;
}

void SetPlaybackVoiceState(uint32_t maskLow, uint32_t maskHigh, const PlaybackPlayer* players, int playerCount) {
    if (playerCount < 0 || players == NULL) {
        playerCount = 0;
    } else if (playerCount > playbackMaxPlayers) {
        playerCount = playbackMaxPlayers;
    }

    voiceMaskLow = maskLow;
    voiceMaskHigh = maskHigh;
    {
        std::lock_guard<std::mutex> lock(playbackPlayersMutex);
        playbackPlayerCount = playerCount;
        if (playerCount > 0) {
            memcpy(playbackPlayers, players, sizeof(PlaybackPlayer) * playerCount);
        }
    }
    PushVoiceState();
}

void ApplyPlaybackAction(const PlaybackAction& action) {
    char command[64];

    switch (action.type) {
        case PLAYBACK_ACTION_TOGGLE_PAUSE:
            QueueEngineCommand(isPlaybackPaused ? "demo_resume" : "demo_pause");
            break;

        case PLAYBACK_ACTION_SEEK:
            QueueSeek(action.tick, 0);
            break;

        case PLAYBACK_ACTION_GOTO_KILL:
            QueueSeek(action.kill.tick, isFollowKillerEnabled ? action.kill.killerSteamId : 0);
            break;

        case PLAYBACK_ACTION_GOTO_SEQUENCE:
            QueueSeek(action.sequence.tick, action.sequence.steamId);
            break;

        case PLAYBACK_ACTION_SET_SPEED:
            snprintf(command, sizeof(command), "demo_timescale %g", action.speed);
            QueueEngineCommand(command);
            break;

        case PLAYBACK_ACTION_TOGGLE_XRAY:
            QueueEngineCommand(isXrayEnabled ? "spec_show_xray 0" : "spec_show_xray 1");
            break;

        case PLAYBACK_ACTION_TOGGLE_BUTTONS_OVERLAY:
            QueueEngineCommand(IsButtonsOverlayVisible() ? "csdm_buttons_overlay 0" : "csdm_buttons_overlay 1");
            break;

        case PLAYBACK_ACTION_TOGGLE_VOICE_INDICATOR:
            QueueEngineCommand(IsVoiceIndicatorVisible() ? "csdm_voice_indicator 0" : "csdm_voice_indicator 1");
            break;

        case PLAYBACK_ACTION_TOGGLE_MATCH_TIMELINE:
            QueueEngineCommand(isMatchTimelineVisible ? "csdm_match_timeline 0" : "csdm_match_timeline 1");
            break;

        case PLAYBACK_ACTION_TOGGLE_ROUND_TIMELINE:
            QueueEngineCommand(isRoundTimelineVisible ? "csdm_round_timeline 0" : "csdm_round_timeline 1");
            break;

        case PLAYBACK_ACTION_TOGGLE_ROUND_TIMELINE_SPECTATED_ONLY:
            QueueEngineCommand(isRoundTimelineSpectatedOnly ? "csdm_round_timeline_spectated_only 0"
                                                            : "csdm_round_timeline_spectated_only 1");
            break;

        case PLAYBACK_ACTION_TOGGLE_FOLLOW_KILLER:
            QueueEngineCommand(isFollowKillerEnabled ? "csdm_follow_killer 0" : "csdm_follow_killer 1");
            break;

        case PLAYBACK_ACTION_SET_LOOP_START:
            SetPlaybackLoopStart(action.tick);
            break;

        case PLAYBACK_ACTION_SET_LOOP_END:
            SetPlaybackLoopEnd(action.tick);
            break;

        case PLAYBACK_ACTION_CLEAR_LOOP:
            ClearPlaybackLoop();
            break;

        case PLAYBACK_ACTION_SET_SEQUENCE_START:
            SetPlaybackSequenceStart(action.tick);
            break;

        case PLAYBACK_ACTION_END_SEQUENCE:
            EndPlaybackSequence(action.tick);
            break;

        case PLAYBACK_ACTION_CLEAR_SEQUENCE_START:
            CancelPlaybackSequence();
            break;

        case PLAYBACK_ACTION_END_PLAYBACK:
            QueueEngineCommand("disconnect");
            break;

        case PLAYBACK_ACTION_PLAY_LAST_DEMO: {
            std::string path;
            {
                std::lock_guard<std::mutex> lock(demoPathMutex);
                path = playbackDemoPath;
            }
            if (!path.empty()) {
                QueueEngineCommand("playdemo \"" + path + "\"");
            }
            break;
        }

        case PLAYBACK_ACTION_SET_VOICE_MASK:
            voiceMaskLow = action.voiceMask.low;
            voiceMaskHigh = action.voiceMask.high;
            PushVoiceState();
            SetListenVoiceMask(action.voiceMask.low, action.voiceMask.high);
            break;

        case PLAYBACK_ACTION_GOTO_CAMERA:
            GoToPlaybackCamera(action.cameraIndex);
            break;

        case PLAYBACK_ACTION_SPECTATE_PLAYERS:
            LeavePlaybackCamera();
            break;

        case PLAYBACK_ACTION_SPECTATE_PLAYER:
            NotePlaybackPlayerPicked(action.slot);
            SpectatePlaybackPlayer(action.slot);
            break;

        case PLAYBACK_ACTION_TOGGLE_PLAYER_LOCK:
            if (lockedSteamId != 0) {
                SetPlaybackLockedPlayer(0);
            } else {
                LockPlaybackSpectatedPlayer();
            }
            break;

        case PLAYBACK_ACTION_SET_BACKGROUND_OPACITY:
            snprintf(command, sizeof(command), "csdm_overlay_background_opacity %g", action.backgroundOpacity);
            QueueEngineCommand(command);
            break;

        case PLAYBACK_ACTION_SET_SCALE:
            snprintf(command, sizeof(command), "csdm_overlay_scale %g", action.scale);
            QueueEngineCommand(command);
            break;

        case PLAYBACK_ACTION_SET_TOOLTIPS_ENABLED:
            snprintf(command, sizeof(command), "csdm_overlay_tooltips %d", action.areTooltipsEnabled ? 1 : 0);
            QueueEngineCommand(command);
            break;

        case PLAYBACK_ACTION_SET_AUTO_HIDE_DELAY:
            snprintf(command, sizeof(command), "csdm_playback_overlay_auto_hide_delay %g", action.autoHideDelay);
            QueueEngineCommand(command);
            break;

        case PLAYBACK_ACTION_SET_SKIP_SECONDS:
            snprintf(command, sizeof(command), "csdm_playback_skip_seconds %d", action.skipSeconds);
            QueueEngineCommand(command);
            break;
    }
}

void SpectatePlaybackPlayer(int slot) {
    if (slot < 0 || slot >= maxPlayerSlots) {
        return;
    }

    // Also sets spec_mode, which spec_player may be ignored without.
    LeavePlaybackCamera();
    char command[32];
    // spec_player takes the controller's entity index.
    snprintf(command, sizeof(command), "spec_player %d", slot + 1);
    QueueEngineCommand(command);
}

void UpdatePlaybackSpectatedPlayer() {
    SpectatedPlayer spectated;
    bool isSpectatingSomeone = GetSpectatedPlayer(&spectated);
    uint64_t steamId = isSpectatingSomeone ? spectated.steamId : 0;
    int slot = isSpectatingSomeone ? spectated.controllerEntityIndex - 1 : -1;
    const char* name = isSpectatingSomeone ? spectated.name : "";
    {
        std::lock_guard<std::mutex> lock(spectatedPlayerMutex);
        if (steamId == spectatedSteamId && slot == spectatedSlot && strcmp(name, spectatedPlayerName) == 0) {
            return;
        }

        spectatedSteamId = steamId;
        spectatedSlot = slot;
        snprintf(spectatedPlayerName, sizeof(spectatedPlayerName), "%s", name);
    }
    PushPanelState();
}

void ResetPlaybackSpectatedPlayer() {
    {
        std::lock_guard<std::mutex> lock(spectatedPlayerMutex);
        spectatedSteamId = 0;
        spectatedSlot = -1;
        spectatedPlayerName[0] = '\0';
    }
    ForgetPendingSpectate();
    PushPanelState();
}
