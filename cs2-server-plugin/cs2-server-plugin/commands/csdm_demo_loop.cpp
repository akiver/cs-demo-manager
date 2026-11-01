#include <string>
#include <vector>

#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"
#include "ui/playback_controls.h"

static const char* usage = "Usage: csdm_demo_loop <minutes:seconds|tick> <minutes:seconds|tick>, csdm_demo_loop clear";

// The console splits arguments on ':', so 12:34 arrives as 12, : and 34. The raw text after the command is split on
// whitespace instead, without the quotes that can surround each part.
static std::vector<std::string> SplitArguments(const char* text) {
    std::vector<std::string> arguments;
    std::string current;
    for (const char* c = text;; c++) {
        bool isSeparator = *c == '\0' || *c == ' ' || *c == '\t' || *c == '\r' || *c == '\n';
        if (isSeparator) {
            if (!current.empty()) {
                arguments.push_back(current);
                current.clear();
            }
            if (*c == '\0') {
                break;
            }
        } else if (*c != '"') {
            current += *c;
        }
    }

    return arguments;
}

static void LogLoopTick(const char* prefix, int tick) {
    int seconds = tick / playbackTickrate;
    Log("%s %d:%02d (tick %d)", prefix, seconds / 60, seconds % 60, tick);
}

CON_COMMAND(csdm_demo_loop,
            "Loops the playback between two times as minutes:seconds or ticks, in any order, usage: "
            "csdm_demo_loop <from> <to>. csdm_demo_loop clear stops looping, without arguments the "
            "current loop is shown") {
    std::vector<std::string> arguments = SplitArguments(args.ArgS());

    if (arguments.empty()) {
        int startTick;
        int endTick;
        GetPlaybackLoop(&startTick, &endTick);
        if (startTick < 0) {
            Log("No loop set");
        } else {
            LogLoopTick("Loop start at", startTick);
            if (endTick >= 0) {
                LogLoopTick("Loop end at", endTick);
            } else {
                Log("Loop end not set");
            }
        }
        return;
    }

    if (arguments.size() == 1 && arguments[0] == "clear") {
        ClearPlaybackLoop();
        return;
    }

    if (arguments.size() != 2) {
        Log("%s", usage);
        return;
    }

    int fromTick = ParseGoToTick(arguments[0].c_str());
    int toTick = ParseGoToTick(arguments[1].c_str());
    if (fromTick < 0 || toTick < 0) {
        Log("%s", usage);
        return;
    }

    if (!SetPlaybackLoop(fromTick, toTick)) {
        Log(fromTick == toTick ? "The two times must differ" : "No demo is playing");
    }
}
