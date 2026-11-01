#include "icvar.h"
#include "log.h"
#include "overlay.h"

static void OnOverlayTooltipsChanged(CConVar<bool>* convar, CSplitScreenSlot slot, const bool* newValue,
                                     const bool* oldValue) {
    bool isEnabled = *newValue;
    SetOverlayTooltipsEnabled(isEnabled);
    Log("Overlay tooltips %s", isEnabled ? "enabled" : "disabled");
}

static CConVar<bool> csdm_overlay_tooltips(
    "csdm_overlay_tooltips", FCVAR_RELEASE,
    "Explains the controls of the overlays with tooltips, 0 to hide them, 1 to show them. The timelines keep theirs.",
    true, OnOverlayTooltipsChanged);
