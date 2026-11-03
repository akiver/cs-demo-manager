#ifdef _WIN32

#include <cstring>
#include <mutex>

#include "buttons_overlay.h"
#include "convars.h"
#include "imgui.h"
#include "overlay.h"
#include "playback_cameras.h"
#include "playback_overlay.h"
#include "playback_overlay_state.h"
#include "plugin.h"
#include "ui/playback_panel.h"
#include "voice_indicator.h"
#include "websocket.h"

// The render thread reads the state directly every frame, there is nothing to push.
void PushVoiceState() {}

void PushTimeline() {}

void PushPanelState() {}

void PlaybackOverlayDrawFrame() {
    if (!isPlaybackPanelVisible) {
        return;
    }

    PlaybackPanelState state = {};
    state.isPlaying = isPlaybackActive;
    state.tick = playbackTick;
    state.totalTicks = playbackTotalTicks;
    state.isPaused = isPlaybackPaused;
    state.speed = playbackSpeed;
    state.isXrayEnabled = isXrayEnabled;
    state.isButtonsOverlayVisible = IsButtonsOverlayVisible();
    state.isVoiceIndicatorVisible = IsVoiceIndicatorVisible();
    state.isMatchTimelineVisible = isMatchTimelineVisible;
    state.isRoundTimelineVisible = isRoundTimelineVisible;
    state.isRoundTimelineSpectatedOnly = isRoundTimelineSpectatedOnly;
    state.isFollowKillerEnabled = isFollowKillerEnabled;
    state.backgroundOpacity = GetOverlayBackgroundOpacity();
    state.scale = GetOverlayScale();
    state.areTooltipsEnabled = AreOverlayTooltipsEnabled();
    state.autoHideDelay = autoHideDelay;
    state.skipSeconds = skipSeconds;
    state.voiceMaskLow = voiceMaskLow;
    state.voiceMaskHigh = voiceMaskHigh;
    {
        std::lock_guard<std::mutex> lock(playbackPlayersMutex);
        state.playerCount = playbackPlayerCount;
        memcpy(state.players, playbackPlayers, sizeof(PlaybackPlayer) * playbackPlayerCount);
    }
    state.spectatedSteamId = spectatedSteamId;
    state.spectatedSlot = spectatedSlot;
    state.lockedSteamId = lockedSteamId;
    state.lockedSlot = lockedSlot;
    state.cameraCount = GetPlaybackCameras(state.cameras, &state.currentCameraIndex);
    state.loopStartTick = loopStartTick;
    state.loopEndTick = loopEndTick;
    state.sequenceStartTick = sequenceStartTick;
    state.isAppConnected = IsWebSocketConnected();
    state.roundDurationSeconds = GetConVarRoundDurationSeconds();
    state.bombTimerSeconds = GetConVarBombTimerSeconds();

    PlaybackPanelActions actions;
    {
        std::lock_guard<std::mutex> lock(timelineMutex);
        actions = DrawPlaybackPanel(state, playbackTimeline);
    }
    for (int i = 0; i < actions.count; i++) {
        ApplyPlaybackAction(actions.actions[i]);
    }
}

void SetPlaybackPanelVisible(bool visible) { isPlaybackPanelVisible = visible; }

void SetPlaybackPanelPosition(float fractionX, float fractionY) { MovePlaybackPanelTo(fractionX, fractionY); }

void GetPlaybackPanelPosition(float* fractionX, float* fractionY) { GetPlaybackPanelPlacement(fractionX, fractionY); }

void SetPlaybackPanelState(const PlaybackState& state) {
    playbackTick = ResolvePlaybackTick(state.tick);
    playbackTotalTicks = state.totalTicks;
    isPlaybackPaused = state.isPaused;
    EnforcePlaybackLoop(state.tick, state.isPaused);
    playbackSpeed = state.speed;
    isXrayEnabled = ReadXrayEnabled();
    ReadRoundClockConVars();
}

#endif
