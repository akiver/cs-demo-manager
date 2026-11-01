#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

static void OnMatchTimelineChanged(CConVar<bool>* convar, CSplitScreenSlot slot, const bool* newValue,
                                   const bool* oldValue) {
    bool isEnabled = *newValue;
    SetPlaybackMatchTimelineVisible(isEnabled);
    Log("Match timeline %s", isEnabled ? "enabled" : "disabled");
}

static CConVar<bool> csdm_match_timeline(
    "csdm_match_timeline", FCVAR_RELEASE,
    "Shows the timeline of the whole match in the playback panel, 0 to hide it, 1 to show it.", true,
    OnMatchTimelineChanged);
