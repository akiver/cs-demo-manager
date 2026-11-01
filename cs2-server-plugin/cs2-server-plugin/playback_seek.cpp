#include <chrono>
#include <cstdio>
#include <mutex>

#include "log.h"
#include "playback_cameras.h"
#include "playback_overlay.h"
#include "playback_overlay_state.h"
#include "player_controllers.h"
#include "plugin.h"

static std::atomic<int> pendingSeekTick{-1};
static std::atomic<long long> seekIssuedMilliseconds{0};
// The player to spectate once the pending seek lands, 0 for nobody.
static std::atomic<uint64_t> pendingSpectateSteamId{0};

static long long NowMilliseconds() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now().time_since_epoch())
        .count();
}

static void BeginPendingSeek(int targetTick) {
    pendingSeekTick = targetTick;
    seekIssuedMilliseconds = NowMilliseconds();
}

static int ResolvePendingSeekTick(int tick, bool* hasLanded) {
    *hasLanded = false;
    int target = pendingSeekTick;
    if (target < 0) {
        return tick;
    }

    int distance = tick > target ? tick - target : target - tick;
    if (distance <= playbackTickrate) {
        pendingSeekTick = -1;
        *hasLanded = true;
        return tick;
    }

    // The timeout unsticks the panel when the demo never reaches the target, e.g. playback ended or the seek was
    // dropped.
    if (NowMilliseconds() - seekIssuedMilliseconds > 15000) {
        pendingSeekTick = -1;
        pendingSpectateSteamId = 0;
        return tick;
    }

    return target;
}

static void SpectatePlaybackPlayerBySteamId(uint64_t steamId) {
    PlayerController controllers[maxPlayerSlots];
    int controllerCount = ListPlayerControllers(controllers, maxPlayerSlots);
    for (int i = 0; i < controllerCount; i++) {
        if (controllers[i].steamId != steamId) {
            continue;
        }

        int slot = controllers[i].entityIndex - 1;
        // Already in their eyes: spectating them again would only reset the view mode.
        if (steamId == spectatedSteamId) {
            PlaybackCamera cameras[playbackMaxCameras];
            int currentCameraIndex;
            GetPlaybackCameras(cameras, &currentCameraIndex);
            if (currentCameraIndex < 0) {
                return;
            }
        }

        Log("Seek landed, spectating slot %d, SteamID %llu", slot, (unsigned long long)steamId);
        SpectatePlaybackPlayer(slot);
        return;
    }

    Log("Seek landed, player with SteamID %llu not found", (unsigned long long)steamId);
}

int ResolvePlaybackTick(int tick) {
    bool hasLanded;
    int shownTick = ResolvePendingSeekTick(tick, &hasLanded);
    if (hasLanded) {
        uint64_t steamId = pendingSpectateSteamId.exchange(0);
        if (steamId != 0) {
            SpectatePlaybackPlayerBySteamId(steamId);
        }
    }

    return shownTick;
}

void QueueSeek(int tick, uint64_t followSteamId) {
    int targetTick = tick < 0 ? 0 : tick;
    BeginPendingSeek(targetTick);
    pendingSpectateSteamId = followSteamId;
    char command[64];
    snprintf(command, sizeof(command), "demo_gototick %d", targetTick);
    QueueEngineCommand(command);
}

void EnforcePlaybackLoop(int tick, bool isPaused) {
    int end = loopEndTick;
    if (end < 0 || isPaused || pendingSeekTick >= 0) {
        return;
    }

    if (tick >= end && tick < end + playbackLoopWrapMarginSeconds * playbackTickrate) {
        QueueSeek(loopStartTick, 0);
    }
}

void ForgetPendingSpectate() { pendingSpectateSteamId = 0; }

static void SeekToTick(int tick) {
    PlaybackAction action = {};
    action.type = PLAYBACK_ACTION_SEEK;
    action.tick = tick;
    ApplyPlaybackAction(action);
}

bool SeekPlaybackToRound(int roundNumber) {
    int targetTick;
    {
        std::lock_guard<std::mutex> lock(timelineMutex);
        if (roundNumber < 1 || roundNumber > (int)playbackTimeline.rounds.size()) {
            return false;
        }
        targetTick = playbackTimeline.rounds[roundNumber - 1].startTick;
    }

    SeekToTick(targetTick);

    return true;
}

// Seeks to the start of the round `offset` rounds away from the current one. Counts from the tick the panel shows so
// a seek issued while another is pending counts from where the demo is heading.
static bool SeekToRoundRelativeToCurrent(int offset) {
    int targetTick;
    {
        std::lock_guard<std::mutex> lock(timelineMutex);
        int targetRound = RoundAtTick(playbackTimeline, playbackTick) + offset;
        if (targetRound < 1 || targetRound > (int)playbackTimeline.rounds.size()) {
            return false;
        }
        targetTick = playbackTimeline.rounds[targetRound - 1].startTick;
    }

    SeekToTick(targetTick);

    return true;
}

bool SeekPlaybackToNextRound() { return SeekToRoundRelativeToCurrent(1); }

bool SeekPlaybackToPreviousRound() { return SeekToRoundRelativeToCurrent(-1); }

bool SeekPlaybackToTick(int tick) {
    if (!isPlaybackActive) {
        return false;
    }

    int totalTicks = playbackTotalTicks;
    SeekToTick(totalTicks > 0 && tick > totalTicks ? totalTicks : tick);

    return true;
}

bool SeekPlaybackBySeconds(float seconds) {
    if (!isPlaybackActive) {
        return false;
    }

    SeekToTick(playbackTick + (int)(seconds * playbackTickrate));

    return true;
}

static bool SeekToKillRelativeToCurrent(bool isNext) {
    PlaybackAction action = {};
    action.type = PLAYBACK_ACTION_GOTO_KILL;
    {
        std::lock_guard<std::mutex> lock(timelineMutex);
        const TimelineKill* kill = FindKillToSeekTo(playbackTimeline, playbackTick, spectatedSteamId, isNext);
        if (kill == NULL) {
            return false;
        }
        action.kill.tick = GetKillSeekTick(*kill);
        action.kill.killerSteamId = kill->killerSteamId;
    }

    ApplyPlaybackAction(action);

    return true;
}

bool SeekPlaybackToNextKill() { return SeekToKillRelativeToCurrent(true); }

bool SeekPlaybackToPreviousKill() { return SeekToKillRelativeToCurrent(false); }

static bool SeekToSequenceRelativeToCurrent(bool isLowlight, bool isNext) {
    PlaybackAction action = {};
    action.type = PLAYBACK_ACTION_GOTO_SEQUENCE;
    {
        std::lock_guard<std::mutex> lock(timelineMutex);
        uint64_t steamId = isRoundTimelineSpectatedOnly ? spectatedSteamId.load() : 0;
        const TimelineSequence* sequence = FindSequenceToSeekTo(
            isLowlight ? playbackTimeline.lowlights : playbackTimeline.highlights, playbackTick, steamId, isNext);
        if (sequence == NULL) {
            return false;
        }
        action.sequence.tick = sequence->startTick;
        action.sequence.steamId = sequence->steamId;
    }

    ApplyPlaybackAction(action);

    return true;
}

bool SeekPlaybackToNextHighlight() { return SeekToSequenceRelativeToCurrent(false, true); }

bool SeekPlaybackToPreviousHighlight() { return SeekToSequenceRelativeToCurrent(false, false); }

bool SeekPlaybackToNextLowlight() { return SeekToSequenceRelativeToCurrent(true, true); }

bool SeekPlaybackToPreviousLowlight() { return SeekToSequenceRelativeToCurrent(true, false); }
