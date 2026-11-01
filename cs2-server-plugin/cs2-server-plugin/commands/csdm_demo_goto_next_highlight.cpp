#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_goto_next_highlight,
            "Seeks the demo to the start of the next highlight and spectates its player. With "
            "csdm_round_timeline_spectated_only on, only the highlights of the spectated player count.") {
    if (!SeekPlaybackToNextHighlight()) {
        Log("No next highlight to go to");
    }
}
