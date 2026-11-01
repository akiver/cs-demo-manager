#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"
#include "ui/playback_controls.h"

static void OnPlaybackOverlayAutoHideDelayChanged(CConVar<float>* convar, CSplitScreenSlot slot, const float* newValue,
                                                  const float* oldValue) {
    float seconds = *newValue;
    SetPlaybackPanelAutoHideDelay(seconds);
    if (seconds > 0.f) {
        Log("Playback panel auto-hide delay set to %g seconds", seconds);
    } else {
        Log("Playback panel auto-hide disabled");
    }
}

static CConVar<float> csdm_playback_overlay_auto_hide_delay(
    "csdm_playback_overlay_auto_hide_delay", FCVAR_RELEASE,
    "Seconds without moving the mouse before the playback panel hides, it comes back on the next mouse move or click. "
    "0 to keep it always shown.",
    playbackPanelDefaultAutoHideDelay, true, 0.f, false, 0.f, OnPlaybackOverlayAutoHideDelayChanged);
