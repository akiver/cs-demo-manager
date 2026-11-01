#include "icvar.h"
#include "log.h"
#include "overlay_positions.h"
#include "ui/playback_controls.h"
#include "voice_indicator.h"

static void OnVoiceIndicatorPosChanged(CConVar<Vector2D>* convar, CSplitScreenSlot slot, const Vector2D* newValue,
                                       const Vector2D* oldValue) {
    if (IsMirroringOverlayPositions()) {
        return;
    }

    SetVoiceIndicatorPosition(newValue->x, newValue->y);
    Log("Voice indicator moved to %.3f %.3f", newValue->x, newValue->y);
}

static CConVar<Vector2D> csdm_voice_indicator_pos(
    "csdm_voice_indicator_pos", FCVAR_RELEASE,
    "Position of the voice indicator as fractions of the screen size, \"x y\" from 0 0 (top left) to 1 1 (bottom "
    "right).",
    Vector2D(voiceIndicatorDefaultFractionX, voiceIndicatorDefaultFractionY), true, Vector2D(0.f, 0.f), true,
    Vector2D(1.f, 1.f), OnVoiceIndicatorPosChanged);
