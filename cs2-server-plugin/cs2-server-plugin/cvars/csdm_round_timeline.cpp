#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

static void OnRoundTimelineChanged(CConVar<bool>* convar, CSplitScreenSlot slot, const bool* newValue,
                                   const bool* oldValue) {
    bool isEnabled = *newValue;
    SetPlaybackRoundTimelineVisible(isEnabled);
    Log("Round timeline %s", isEnabled ? "enabled" : "disabled");
}

static CConVar<bool> csdm_round_timeline(
    "csdm_round_timeline", FCVAR_RELEASE,
    "Shows the timeline of the current round in the playback panel, 0 to hide it, 1 to show it.", true,
    OnRoundTimelineChanged);
