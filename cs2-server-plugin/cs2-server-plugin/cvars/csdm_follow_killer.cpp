#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

static void OnFollowKillerChanged(CConVar<bool>* convar, CSplitScreenSlot slot, const bool* newValue,
                                  const bool* oldValue) {
    bool isEnabled = *newValue;
    SetPlaybackFollowKillerEnabled(isEnabled);
    Log("Seeking to a kill %s", isEnabled ? "now follows the killer" : "keeps the current view");
}

static CConVar<bool> csdm_follow_killer(
    "csdm_follow_killer", FCVAR_RELEASE,
    "Spectates the killer after seeking to a kill (arrows, goto kill commands, round timeline), 0 to keep the current "
    "view, 1 to follow.",
    false, OnFollowKillerChanged);
