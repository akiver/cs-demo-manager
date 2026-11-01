#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

static void OnRoundTimelineSpectatedOnlyChanged(CConVar<bool>* convar, CSplitScreenSlot slot, const bool* newValue,
                                                const bool* oldValue) {
    bool isEnabled = *newValue;
    SetPlaybackRoundTimelineSpectatedOnly(isEnabled);
    Log("Round timeline %s", isEnabled ? "limited to the spectated player" : "showing every player");
}

static CConVar<bool> csdm_round_timeline_spectated_only(
    "csdm_round_timeline_spectated_only", FCVAR_RELEASE,
    "Limits the round timeline and the highlight navigation to the spectated player, 0 for everyone, 1 for them "
    "only.",
    false, OnRoundTimelineSpectatedOnlyChanged);
