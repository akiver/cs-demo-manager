#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_goto_next_round, "Seeks the demo to the start of the next round") {
    if (!SeekPlaybackToNextRound()) {
        Log("No next round to go to");
    }
}
