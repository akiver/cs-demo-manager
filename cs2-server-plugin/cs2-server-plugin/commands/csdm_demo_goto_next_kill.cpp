#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_goto_next_kill,
            "Seeks the demo a few seconds ahead of the next kill, of the spectated player when there is one") {
    if (!SeekPlaybackToNextKill()) {
        Log("No next kill to go to");
    }
}
