#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_goto_previous_kill,
            "Seeks the demo a few seconds ahead of the previous kill, of the spectated player when there is one") {
    if (!SeekPlaybackToPreviousKill()) {
        Log("No previous kill to go to");
    }
}
