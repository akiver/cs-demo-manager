#include "overlay_positions.h"

#include <cmath>

#include "buttons_overlay.h"
#include "convars.h"
#include "playback_overlay.h"
#include "voice_indicator.h"

// Under a tenth of a pixel on a 1000 pixels wide display. A panel kept on screen by the drawing code ends up a rounding
// error away from the value asked for, which must not be written back forever.
constexpr float positionTolerance = 0.0001f;

static CachedConVar buttonsOverlayPositionConVar = {"csdm_buttons_overlay_pos"};
static CachedConVar playbackPanelPositionConVar = {"csdm_playback_overlay_pos"};
static CachedConVar voiceIndicatorPositionConVar = {"csdm_voice_indicator_pos"};
static bool isMirroring = false;

static void MirrorPosition(CachedConVar& convar, float x, float y) {
    float convarX = 0.f;
    float convarY = 0.f;
    if (!ReadConVarVector2D(convar, &convarX, &convarY)) {
        return;
    }
    if (fabsf(convarX - x) < positionTolerance && fabsf(convarY - y) < positionTolerance) {
        return;
    }

    isMirroring = true;
    WriteConVarVector2D(convar, x, y);
    isMirroring = false;
}

void UpdateOverlayPositionConVars() {
    float x = 0.f;
    float y = 0.f;
    GetButtonsOverlayPosition(&x, &y);
    MirrorPosition(buttonsOverlayPositionConVar, x, y);
    GetPlaybackPanelPosition(&x, &y);
    MirrorPosition(playbackPanelPositionConVar, x, y);
    GetVoiceIndicatorPosition(&x, &y);
    MirrorPosition(voiceIndicatorPositionConVar, x, y);
}

bool IsMirroringOverlayPositions() { return isMirroring; }
