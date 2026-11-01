#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_goto_previous_lowlight,
            "Seeks the demo to the start of the previous lowlight and spectates its player. With "
            "csdm_round_timeline_spectated_only on, only the lowlights of the spectated player count.") {
    if (!SeekPlaybackToPreviousLowlight()) {
        Log("No previous lowlight to go to");
    }
}
