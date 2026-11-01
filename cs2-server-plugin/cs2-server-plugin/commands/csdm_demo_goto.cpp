#include <string>

#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"
#include "ui/playback_controls.h"

CON_COMMAND(csdm_demo_goto,
            "Seeks the demo to a time as minutes:seconds or to a tick, usage: csdm_demo_goto <minutes:seconds|tick>") {
    // The console splits arguments on ':', so 12:34 arrives as 12, : and 34. The raw text after the command is read
    // instead, without the quotes and whitespace that can surround it.
    std::string text = args.ArgS();
    const char* trimmed = " \t\r\n\"";
    size_t start = text.find_first_not_of(trimmed);
    text = start == std::string::npos ? "" : text.substr(start, text.find_last_not_of(trimmed) - start + 1);

    int tick = ParseGoToTick(text.c_str());
    if (tick < 0) {
        Log("Usage: csdm_demo_goto <minutes:seconds|tick>");
        return;
    }

    if (!SeekPlaybackToTick(tick)) {
        Log("No demo is playing");
    }
}
