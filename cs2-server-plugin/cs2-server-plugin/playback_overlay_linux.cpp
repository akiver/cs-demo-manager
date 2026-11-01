#ifndef _WIN32

#include <dlfcn.h>

#include <atomic>
#include <cstddef>
#include <mutex>

#include "buttons_overlay.h"
#include "convars.h"
#include "maths.h"
#include "playback_cameras.h"
#include "playback_overlay.h"
#include "playback_overlay_state.h"
#include "plugin.h"
#include "voice_indicator.h"
#include "websocket.h"

typedef void (*OverlaySetPlaybackVisibleFn)(int isVisible);
typedef void (*OverlaySetPlaybackStateFn)(const OverlayPlaybackState* state);
typedef void (*OverlaySetPlaybackVoiceFn)(uint32_t maskLow, uint32_t maskHigh, int playerCount,
                                          const PlaybackPlayer* players);
typedef void (*OverlaySetPlaybackActionCallbackFn)(PlaybackActionCallback callback);
typedef void (*OverlaySetPlaybackTimelineFn)(const OverlayPlaybackTimeline* timeline);
typedef void (*OverlaySetPlaybackPositionFn)(float fractionX, float fractionY);
typedef int (*OverlayGetPlaybackPositionFn)(float* fractionX, float* fractionY);

static OverlaySetPlaybackVisibleFn layerSetPlaybackVisible = NULL;
static OverlaySetPlaybackStateFn layerSetPlaybackState = NULL;
static OverlaySetPlaybackVoiceFn layerSetPlaybackVoice = NULL;
static OverlaySetPlaybackActionCallbackFn layerSetPlaybackActionCallback = NULL;
static OverlaySetPlaybackTimelineFn layerSetPlaybackTimeline = NULL;
static OverlaySetPlaybackPositionFn layerSetPlaybackPosition = NULL;
static OverlayGetPlaybackPositionFn layerGetPlaybackPosition = NULL;

static std::atomic<bool> hasGivenPanelPosition{false};
static std::atomic<float> panelFractionX{playbackPanelDefaultFractionX};
static std::atomic<float> panelFractionY{playbackPanelDefaultFractionY};

static void OnLayerPlaybackAction(const PlaybackAction* action) {
    if (action != NULL) {
        ApplyPlaybackAction(*action);
    }
}

void PushVoiceState() {
    if (layerSetPlaybackVoice == NULL) {
        return;
    }

    std::lock_guard<std::mutex> lock(playbackPlayersMutex);
    layerSetPlaybackVoice(voiceMaskLow, voiceMaskHigh, playbackPlayerCount, playbackPlayers);
}

void PushTimeline() {
    if (layerSetPlaybackTimeline == NULL) {
        return;
    }

    std::lock_guard<std::mutex> lock(timelineMutex);
    OverlayPlaybackTimeline timeline = {};
    timeline.roundDurationSeconds = playbackTimeline.roundDurationSeconds;
    timeline.roundCount = (int)playbackTimeline.rounds.size();
    timeline.rounds = playbackTimeline.rounds.data();
    timeline.killCount = (int)playbackTimeline.kills.size();
    timeline.kills = playbackTimeline.kills.data();
    timeline.bombPlantCount = (int)playbackTimeline.bombPlants.size();
    timeline.bombPlants = playbackTimeline.bombPlants.data();
    timeline.bombDefuseCount = (int)playbackTimeline.bombDefuses.size();
    timeline.bombDefuses = playbackTimeline.bombDefuses.data();
    timeline.bombExplosionCount = (int)playbackTimeline.bombExplosions.size();
    timeline.bombExplosions = playbackTimeline.bombExplosions.data();
    timeline.highlightCount = (int)playbackTimeline.highlights.size();
    timeline.highlights = playbackTimeline.highlights.data();
    timeline.lowlightCount = (int)playbackTimeline.lowlights.size();
    timeline.lowlights = playbackTimeline.lowlights.data();
    layerSetPlaybackTimeline(&timeline);
}

static void PushPanelPosition() {
    if (layerSetPlaybackPosition != NULL && hasGivenPanelPosition) {
        layerSetPlaybackPosition(panelFractionX, panelFractionY);
    }
}

void PushPanelState() {
    if (layerSetPlaybackState == NULL) {
        return;
    }

    OverlayPlaybackState state = {};
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
    state.autoHideDelay = autoHideDelay;
    state.skipSeconds = skipSeconds;
    state.spectatedSteamId = spectatedSteamId;
    state.spectatedSlot = spectatedSlot;
    state.loopStartTick = loopStartTick;
    state.loopEndTick = loopEndTick;
    state.sequenceStartTick = sequenceStartTick;
    state.isAppConnected = IsWebSocketConnected();
    state.roundDurationSeconds = GetConVarRoundDurationSeconds();
    state.bombTimerSeconds = GetConVarBombTimerSeconds();
    layerSetPlaybackState(&state);
}

bool PlaybackOverlayConnectLayer(void* layerLib) {
    layerSetPlaybackVisible = (OverlaySetPlaybackVisibleFn)dlsym(layerLib, "CsdmOverlaySetPlaybackVisible");
    layerSetPlaybackState = (OverlaySetPlaybackStateFn)dlsym(layerLib, "CsdmOverlaySetPlaybackState");
    layerSetPlaybackVoice = (OverlaySetPlaybackVoiceFn)dlsym(layerLib, "CsdmOverlaySetPlaybackVoice");
    layerSetPlaybackActionCallback =
        (OverlaySetPlaybackActionCallbackFn)dlsym(layerLib, "CsdmOverlaySetPlaybackActionCallback");
    layerSetPlaybackTimeline = (OverlaySetPlaybackTimelineFn)dlsym(layerLib, "CsdmOverlaySetPlaybackTimeline");
    layerSetPlaybackPosition = (OverlaySetPlaybackPositionFn)dlsym(layerLib, "CsdmOverlaySetPlaybackPosition");
    layerGetPlaybackPosition = (OverlayGetPlaybackPositionFn)dlsym(layerLib, "CsdmOverlayGetPlaybackPosition");
    if (layerSetPlaybackVisible == NULL || layerSetPlaybackState == NULL || layerSetPlaybackVoice == NULL ||
        layerSetPlaybackActionCallback == NULL || layerSetPlaybackTimeline == NULL ||
        layerSetPlaybackPosition == NULL || layerGetPlaybackPosition == NULL ||
        !PlaybackCamerasConnectLayer(layerLib)) {
        return false;
    }

    // The layer starts hidden and empty, so replay everything set before it was connected.
    layerSetPlaybackActionCallback(&OnLayerPlaybackAction);
    PushPanelPosition();
    PushVoiceState();
    PushTimeline();
    PushPanelState();
    layerSetPlaybackVisible(isPlaybackPanelVisible ? 1 : 0);

    return true;
}

void PlaybackOverlayDisconnectLayer() {
    // Clear the callback first so the layer can't call into a plugin being unloaded.
    if (layerSetPlaybackActionCallback != NULL) {
        layerSetPlaybackActionCallback(NULL);
    }
    PlaybackCamerasDisconnectLayer();
    if (layerSetPlaybackVisible != NULL) {
        layerSetPlaybackVisible(0);
    }
    layerSetPlaybackVisible = NULL;
    layerSetPlaybackState = NULL;
    layerSetPlaybackVoice = NULL;
    layerSetPlaybackActionCallback = NULL;
    layerSetPlaybackTimeline = NULL;
    layerSetPlaybackPosition = NULL;
    layerGetPlaybackPosition = NULL;
}

void SetPlaybackPanelVisible(bool visible) {
    isPlaybackPanelVisible = visible;
    if (layerSetPlaybackVisible != NULL) {
        layerSetPlaybackVisible(visible ? 1 : 0);
    }
}

void SetPlaybackPanelPosition(float fractionX, float fractionY) {
    panelFractionX = ClampToRange(fractionX, 0.f, 1.f);
    panelFractionY = ClampToRange(fractionY, 0.f, 1.f);
    hasGivenPanelPosition = true;
    PushPanelPosition();
}

void GetPlaybackPanelPosition(float* fractionX, float* fractionY) {
    if (layerGetPlaybackPosition != NULL && layerGetPlaybackPosition(fractionX, fractionY) != 0) {
        return;
    }

    // No layer or no position from it: fall back to the last position given, or the default.
    *fractionX = panelFractionX;
    *fractionY = panelFractionY;
}

void SetPlaybackPanelState(const PlaybackState& state) {
    playbackTick = ResolvePlaybackTick(state.tick);
    playbackTotalTicks = state.totalTicks;
    isPlaybackPaused = state.isPaused;
    EnforcePlaybackLoop(state.tick, state.isPaused);
    playbackSpeed = state.speed;
    isXrayEnabled = ReadXrayEnabled();
    ReadRoundClockConVars();
    PushPanelState();
}

#endif
