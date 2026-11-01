#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_goto_previous_round, "Seeks the demo to the start of the previous round") {
    if (!SeekPlaybackToPreviousRound()) {
        Log("No previous round to go to");
    }
}
