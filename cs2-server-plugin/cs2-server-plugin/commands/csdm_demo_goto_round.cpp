#include <cstdlib>

#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_goto_round,
            "Seeks the demo to the start of a round, usage: csdm_demo_goto_round <round_number>") {
    if (args.ArgC() < 2) {
        Log("Usage: csdm_demo_goto_round <round_number>");
        return;
    }

    if (!SeekPlaybackToRound(atoi(args.Arg(1)))) {
        Log("No round %s to go to", args.Arg(1));
    }
}
