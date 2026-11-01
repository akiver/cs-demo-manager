#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_goto_next_lowlight,
            "Seeks the demo to the start of the next lowlight and spectates its player. With "
            "csdm_round_timeline_spectated_only on, only the lowlights of the spectated player count.") {
    if (!SeekPlaybackToNextLowlight()) {
        Log("No next lowlight to go to");
    }
}
