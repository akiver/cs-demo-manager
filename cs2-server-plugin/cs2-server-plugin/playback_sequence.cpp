#include <atomic>
#include <cstdint>
#include <cstdio>
#include <mutex>
#include <nlohmann/json.hpp>
#include <string>

#include "log.h"
#include "overlay.h"
#include "playback_overlay.h"
#include "playback_overlay_state.h"
#include "websocket.h"

// The sequence button of the playback panel.
// A first click marks the start of a video sequence, a second its end.
// The sequence then goes to the app over the WebSocket, which adds it to the video page of the match with the
// spectated player as the camera focus.

std::atomic<int> sequenceStartTick{-1};

static void LogSequenceTick(const char* prefix, int tick) {
    int seconds = tick / playbackTickrate;
    Log("%s %d:%02d (tick %d)", prefix, seconds / 60, seconds % 60, tick);
}

void SetPlaybackSequenceStart(int tick) {
    if (tick < 0) {
        tick = 0;
    }
    sequenceStartTick = tick;
    LogSequenceTick("Video sequence start set at", tick);
    PushPanelState();
}

void ClearPlaybackSequenceStart() {
    if (sequenceStartTick < 0) {
        return;
    }

    sequenceStartTick = -1;
    Log("Video sequence start cleared");
    PushPanelState();
}

void CancelPlaybackSequence() {
    if (sequenceStartTick < 0) {
        return;
    }

    ClearPlaybackSequenceStart();
    ShowOverlayToast("Video sequence cancelled");
}

bool EndPlaybackSequence(int tick) {
    int start = sequenceStartTick;
    if (start < 0) {
        SetPlaybackSequenceStart(tick);
        return false;
    }
    if (tick == start) {
        LogSequenceTick("Video sequence end ignored, it is the start:", tick);
        return false;
    }
    if (tick < start) {
        int end = start;
        start = tick;
        tick = end;
    }

    std::string demoPath;
    std::string checksum;
    {
        std::lock_guard<std::mutex> lock(demoPathMutex);
        demoPath = playbackDemoPath;
        checksum = playbackDemoChecksum;
    }
    if (demoPath.empty()) {
        Log("Video sequence not sent, the demo path is unknown");
        return false;
    }
    if (!IsWebSocketConnected()) {
        Log("Video sequence not sent, the app is not connected");
        return false;
    }

    nlohmann::json payload;
    payload["demoPath"] = demoPath;
    // Null when the demo hasn't been analyzed: the app keeps the sequence by demo path but has no match page for it.
    if (checksum.empty()) {
        payload["checksum"] = nullptr;
    } else {
        payload["checksum"] = checksum;
    }
    payload["startTick"] = start;
    payload["endTick"] = tick;
    uint64_t steamId;
    std::string playerName;
    {
        std::lock_guard<std::mutex> lock(spectatedPlayerMutex);
        steamId = spectatedSteamId;
        playerName = spectatedPlayerName;
    }
    if (steamId != 0) {
        char steamIdText[32];
        snprintf(steamIdText, sizeof(steamIdText), "%llu", (unsigned long long)steamId);
        nlohmann::json player;
        player["steamId"] = steamIdText;
        player["name"] = playerName;
        payload["focusedPlayer"] = player;
    } else {
        payload["focusedPlayer"] = nullptr;
    }
    nlohmann::json message;
    message["name"] = "add-video-sequence";
    message["payload"] = payload;
    SendMsg(message);
    LogSequenceTick("Video sequence sent to the app, start at", start);
    LogSequenceTick("Video sequence end at", tick);
    int startSeconds = start / playbackTickrate;
    int endSeconds = tick / playbackTickrate;
    char toast[96];
    snprintf(toast, sizeof(toast), "Video sequence %d:%02d - %d:%02d sent to CS Demo Manager", startSeconds / 60,
             startSeconds % 60, endSeconds / 60, endSeconds % 60);
    ShowOverlayToast(toast);

    sequenceStartTick = -1;
    PushPanelState();

    return true;
}
