#include "buttons_overlay.h"
#include "buttons_overlay_target.h"
#include "icvar.h"
#include "log.h"

static void OnButtonsOverlayChanged(CConVar<bool>* convar, CSplitScreenSlot slot, const bool* newValue,
                                    const bool* oldValue) {
    bool isEnabled = *newValue;
    ResetButtonsOverlayTarget();
    SetButtonsOverlayVisible(isEnabled);
    Log("Buttons overlay %s", isEnabled ? "enabled" : "disabled");
}

static CConVar<bool> csdm_buttons_overlay(
    "csdm_buttons_overlay", FCVAR_RELEASE,
    "Draws the buttons pressed by the currently spectated player, 0 to hide it, 1 to show it.", false,
    OnButtonsOverlayChanged);
