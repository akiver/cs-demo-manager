#include "icvar.h"
#include "log.h"
#include "overlay_positions.h"
#include "playback_overlay.h"
#include "ui/playback_controls.h"

static void OnPlaybackOverlayPosChanged(CConVar<Vector2D>* convar, CSplitScreenSlot slot, const Vector2D* newValue,
                                        const Vector2D* oldValue) {
    if (IsMirroringOverlayPositions()) {
        return;
    }

    SetPlaybackPanelPosition(newValue->x, newValue->y);
    Log("Playback panel moved to %.3f %.3f", newValue->x, newValue->y);
}

static CConVar<Vector2D> csdm_playback_overlay_pos(
    "csdm_playback_overlay_pos", FCVAR_RELEASE,
    "Position of the playback panel as fractions of the screen size, \"x y\" from 0 0 (top left) to 1 1 (bottom "
    "right).",
    Vector2D(playbackPanelDefaultFractionX, playbackPanelDefaultFractionY), true, Vector2D(0.f, 0.f), true,
    Vector2D(1.f, 1.f), OnPlaybackOverlayPosChanged);
