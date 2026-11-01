#include "icvar.h"
#include "log.h"
#include "overlay.h"
#include "ui/playback_controls.h"

static void OnOverlayScaleChanged(CConVar<float>* convar, CSplitScreenSlot slot, const float* newValue,
                                  const float* oldValue) {
    SetOverlayScale(*newValue);
    Log("Overlay scale set to %g", *newValue);
}

static CConVar<float> csdm_overlay_scale(
    "csdm_overlay_scale", FCVAR_RELEASE,
    "Size of the overlays on top of their scaling to the resolution, from 0.5 (half) to 2 (double).",
    overlayDefaultScale, true, overlayMinScale, true, overlayMaxScale, OnOverlayScaleChanged);
