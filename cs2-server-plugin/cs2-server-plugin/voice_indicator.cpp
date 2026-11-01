#include "voice_indicator.h"

#include <atomic>
#include <cstddef>
#include <cstring>
#include <mutex>

static std::atomic<bool> isVoiceIndicatorVisible{true};
// Comes from the game thread, read by whatever draws the indicator. The count is atomic so IsVoiceIndicatorDrawn can
// read it without the lock, and is written under the mutex so it always matches the players.
static std::mutex talkingPlayersMutex;
static VoiceIndicatorPlayer talkingPlayers[voiceIndicatorMaxPlayers];
static std::atomic<int> talkingPlayerCount{0};

// Hands the state to whatever draws the indicator.
static void PushState();

bool IsVoiceIndicatorVisible() { return isVoiceIndicatorVisible; }

bool IsVoiceIndicatorDrawn() { return isVoiceIndicatorVisible && talkingPlayerCount > 0; }

void SetVoiceIndicatorState(const VoiceIndicatorPlayer* players, int playerCount) {
    if (playerCount < 0 || players == NULL) {
        playerCount = 0;
    } else if (playerCount > voiceIndicatorMaxPlayers) {
        playerCount = voiceIndicatorMaxPlayers;
    }

    {
        std::lock_guard<std::mutex> lock(talkingPlayersMutex);
        talkingPlayerCount = playerCount;
        if (playerCount > 0) {
            memcpy(talkingPlayers, players, sizeof(VoiceIndicatorPlayer) * playerCount);
        }
    }
    PushState();
}

#ifdef _WIN32

#include "overlay.h"
#include "ui/voice_indicator_panel.h"

// The render thread reads the state directly at every frame, there is nothing to push.
static void PushState() {}

void VoiceIndicatorDrawFrame() {
    if (!isVoiceIndicatorVisible) {
        return;
    }

    VoiceIndicatorState state = {};
    {
        std::lock_guard<std::mutex> lock(talkingPlayersMutex);
        state.playerCount = talkingPlayerCount;
        memcpy(state.players, talkingPlayers, sizeof(VoiceIndicatorPlayer) * state.playerCount);
    }
    DrawVoiceIndicatorPanel(state, GetOverlayBackgroundOpacity(), GetOverlayScale());
}

void SetVoiceIndicatorVisible(bool visible) {
    isVoiceIndicatorVisible = visible;
    if (!visible) {
        SetVoiceIndicatorState(NULL, 0);
    }
}

void SetVoiceIndicatorPosition(float fractionX, float fractionY) { MoveVoiceIndicatorPanelTo(fractionX, fractionY); }

void GetVoiceIndicatorPosition(float* fractionX, float* fractionY) {
    GetVoiceIndicatorPanelPlacement(fractionX, fractionY);
}

#else

#include <dlfcn.h>

#include "maths.h"

typedef void (*OverlaySetVoiceIndicatorFn)(int isVisible, int playerCount, const VoiceIndicatorPlayer* players);
typedef void (*OverlaySetVoiceIndicatorPositionFn)(float fractionX, float fractionY);
typedef int (*OverlayGetVoiceIndicatorPositionFn)(float* fractionX, float* fractionY);

static OverlaySetVoiceIndicatorFn layerSetVoiceIndicator = NULL;
static OverlaySetVoiceIndicatorPositionFn layerSetVoiceIndicatorPosition = NULL;
static OverlayGetVoiceIndicatorPositionFn layerGetVoiceIndicatorPosition = NULL;

// The last position given, so it survives the layer not being loaded and is replayed when it connects.
static std::atomic<bool> hasGivenPanelPosition{false};
static std::atomic<float> panelFractionX{voiceIndicatorDefaultFractionX};
static std::atomic<float> panelFractionY{voiceIndicatorDefaultFractionY};

static void PushPanelPosition() {
    if (layerSetVoiceIndicatorPosition != NULL && hasGivenPanelPosition) {
        layerSetVoiceIndicatorPosition(panelFractionX, panelFractionY);
    }
}

static void PushState() {
    if (layerSetVoiceIndicator == NULL) {
        return;
    }

    std::lock_guard<std::mutex> lock(talkingPlayersMutex);
    layerSetVoiceIndicator(isVoiceIndicatorVisible ? 1 : 0, talkingPlayerCount.load(), talkingPlayers);
}

bool VoiceIndicatorConnectLayer(void* layerLib) {
    layerSetVoiceIndicator = (OverlaySetVoiceIndicatorFn)dlsym(layerLib, "CsdmOverlaySetVoiceIndicator");
    layerSetVoiceIndicatorPosition =
        (OverlaySetVoiceIndicatorPositionFn)dlsym(layerLib, "CsdmOverlaySetVoiceIndicatorPosition");
    layerGetVoiceIndicatorPosition =
        (OverlayGetVoiceIndicatorPositionFn)dlsym(layerLib, "CsdmOverlayGetVoiceIndicatorPosition");
    if (layerSetVoiceIndicator == NULL || layerSetVoiceIndicatorPosition == NULL ||
        layerGetVoiceIndicatorPosition == NULL) {
        return false;
    }

    // The layer starts hidden and empty, so replay the current state.
    PushPanelPosition();
    PushState();

    return true;
}

void VoiceIndicatorDisconnectLayer() {
    if (layerSetVoiceIndicator != NULL) {
        layerSetVoiceIndicator(0, 0, NULL);
    }
    layerSetVoiceIndicator = NULL;
    layerSetVoiceIndicatorPosition = NULL;
    layerGetVoiceIndicatorPosition = NULL;
}

void SetVoiceIndicatorPosition(float fractionX, float fractionY) {
    panelFractionX = ClampToRange(fractionX, 0.f, 1.f);
    panelFractionY = ClampToRange(fractionY, 0.f, 1.f);
    hasGivenPanelPosition = true;
    PushPanelPosition();
}

void GetVoiceIndicatorPosition(float* fractionX, float* fractionY) {
    if (layerGetVoiceIndicatorPosition != NULL && layerGetVoiceIndicatorPosition(fractionX, fractionY) != 0) {
        return;
    }

    // No layer or no position from it, fall back to the last position given or the default.
    *fractionX = panelFractionX;
    *fractionY = panelFractionY;
}

void SetVoiceIndicatorVisible(bool visible) {
    isVoiceIndicatorVisible = visible;
    if (!visible) {
        SetVoiceIndicatorState(NULL, 0);
    } else {
        PushState();
    }
}

#endif
