#include <cstdlib>

#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_demo_skip,
            "Seeks the demo forward by a number of seconds, or back when it's negative, usage: csdm_demo_skip "
            "<seconds>") {
    if (args.ArgC() < 2) {
        Log("Usage: csdm_demo_skip <seconds>");
        return;
    }

    char* end;
    float seconds = strtof(args.Arg(1), &end);
    if (end == args.Arg(1) || *end != '\0' || seconds == 0.f) {
        Log("Usage: csdm_demo_skip <seconds>");
        return;
    }

    if (!SeekPlaybackBySeconds(seconds)) {
        Log("No demo is playing");
    }
}
