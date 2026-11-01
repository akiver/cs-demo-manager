#include "icvar.h"
#include "log.h"
#include "overlay.h"
#include "ui/playback_controls.h"

static void OnOverlayBackgroundOpacityChanged(CConVar<float>* convar, CSplitScreenSlot slot, const float* newValue,
                                              const float* oldValue) {
    SetOverlayBackgroundOpacity(*newValue);
    Log("Overlay background opacity set to %g", *newValue);
}

static CConVar<float> csdm_overlay_background_opacity(
    "csdm_overlay_background_opacity", FCVAR_RELEASE,
    "Opacity of the background of the overlays (playback panel and its menus, pressed keys, voice indicator), from 0 "
    "(transparent) to 1 (opaque).",
    overlayDefaultBackgroundOpacity, true, 0.f, true, 1.f, OnOverlayBackgroundOpacityChanged);
