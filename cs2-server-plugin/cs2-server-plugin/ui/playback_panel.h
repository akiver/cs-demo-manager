#pragma once

#include <cstdint>

#include "imgui.h"
#include "playback_timeline.h"

struct PlaybackPanelState {
    bool isPlaying;  // Whether a demo is being played.
    int tick;
    int totalTicks;
    bool isPaused;
    float speed;
    bool isXrayEnabled;
    bool isButtonsOverlayVisible;
    bool isVoiceIndicatorVisible;
    bool isMatchTimelineVisible;
    bool isRoundTimelineVisible;
    // Whether the round timeline only shows the events of the spectated player, when there is one.
    bool isRoundTimelineSpectatedOnly;
    // Whether seeking to a kill also spectates its killer.
    bool isFollowKillerEnabled;
    float backgroundOpacity;
    // Factor applied on top of the resolution-based scale, see overlayDefaultScale.
    float scale;
    bool areTooltipsEnabled;
    float autoHideDelay;
    // How far the skip buttons seek.
    int skipSeconds;
    // The tv_listen_voice_indices/tv_listen_voice_indices_h values the voice menu checkboxes reflect.
    uint32_t voiceMaskLow;
    uint32_t voiceMaskHigh;
    int playerCount;
    PlaybackPlayer players[playbackMaxPlayers];
    uint64_t spectatedSteamId;
    int spectatedSlot;
    int cameraCount;
    PlaybackCamera cameras[playbackMaxCameras];
    // The camera the view was last moved to, -1 when following the players.
    int currentCameraIndex;
    // The ticks the playback loops between, -1 while not set. The end is never set without the start.
    int loopStartTick;
    int loopEndTick;
    // The tick a video sequence was started at with the sequence button, -1 while none is pending.
    int sequenceStartTick;
    // Whether the app is connected, which the sequence button needs to send it the sequence.
    bool isAppConnected;
    // The round time and bomb timer of the server that recorded the demo, from its convars. 0 while unavailable.
    int roundDurationSeconds;
    int bombTimerSeconds;
};

PlaybackPanelActions DrawPlaybackPanel(const PlaybackPanelState& state, const PlaybackTimeline& timeline);

// Moves the panel's bottom center to these fractions of the display size, clamped to [0, 1], on the next frame.
void MovePlaybackPanelTo(float fractionX, float fractionY);
void GetPlaybackPanelPlacement(float* fractionX, float* fractionY);
// The rectangle the panel was drawn in during the current ImGui frame, false when it wasn't drawn this frame.
bool GetPlaybackPanelRect(ImVec2* position, ImVec2* size);
