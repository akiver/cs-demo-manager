#include "buttons_overlay.h"
#include "icvar.h"
#include "log.h"
#include "overlay_positions.h"
#include "ui/playback_controls.h"

static void OnButtonsOverlayPosChanged(CConVar<Vector2D>* convar, CSplitScreenSlot slot, const Vector2D* newValue,
                                       const Vector2D* oldValue) {
    if (IsMirroringOverlayPositions()) {
        return;
    }

    SetButtonsOverlayPosition(newValue->x, newValue->y);
    Log("Buttons overlay moved to %.3f %.3f", newValue->x, newValue->y);
}

static CConVar<Vector2D> csdm_buttons_overlay_pos(
    "csdm_buttons_overlay_pos", FCVAR_RELEASE,
    "Position of the pressed buttons panel as fractions of the screen size, \"x y\" from 0 0 (top left) to 1 1 "
    "(bottom right).",
    Vector2D(buttonsOverlayDefaultFractionX, buttonsOverlayDefaultFractionY), true, Vector2D(0.f, 0.f), true,
    Vector2D(1.f, 1.f), OnButtonsOverlayPosChanged);
