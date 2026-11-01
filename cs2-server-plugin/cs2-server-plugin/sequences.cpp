#include "sequences.h"

#include <chrono>
#include <fstream>
#include <mutex>
#include <nlohmann/json.hpp>
#include <queue>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

#include "cdll_interfaces.h"
#include "log.h"
#include "plugin.h"

using nlohmann::json;
using std::string;

struct Action {
    int tick;
    string cmd;
};

struct Sequence {
    std::vector<Action> actions;
};

static std::mutex sequencesMutex;
static std::queue<Sequence> sequences;

static bool FileExists(const std::string& name) {
    std::ifstream f(name.c_str());

    return f.good();
}

int GetSequenceCount() {
    std::lock_guard<std::mutex> lock(sequencesMutex);

    return (int)sequences.size();
}

void LoadSequencesFile(const std::string& demoPath) {
    std::lock_guard<std::mutex> lock(sequencesMutex);
    sequences = {};

    string demoJsonPath = demoPath + ".json";
    if (!FileExists(demoJsonPath)) {
        Log("JSON sequences file not found at %s", demoJsonPath.c_str());
        return;
    }

    Log("Loading JSON file %s", demoJsonPath.c_str());
    try {
        std::ifstream jsonFile(demoJsonPath);
        json jsonSequences = json::parse(jsonFile);

        std::istringstream stream(jsonSequences.dump(2));
        string line;
        while (std::getline(stream, line)) {
            Log("%s", line.c_str());
        }

        if (jsonSequences.size() == 0) {
            Log("No sequences found in JSON file");
            return;
        }

        Log("Loading %d sequences", jsonSequences.size());
        for (auto jsonSequence : jsonSequences) {
            Sequence sequence;
            for (auto jsonAction : jsonSequence["actions"]) {
                Action action;
                action.tick = jsonAction["tick"];
                action.cmd = jsonAction["cmd"];
                sequence.actions.push_back(action);
            }
            sequences.push(sequence);
            Log("Sequence with %d actions loaded", sequence.actions.size());
        }

        Log("%d sequences loaded", sequences.size());
    } catch (const std::exception& exception) {
        Log("JSON sequences file %s can't be read: %s", demoJsonPath.c_str(), exception.what());
        sequences = {};
    }
}

void ProcessSequences(ISource2EngineToClient* engine, int newTick) {
    std::lock_guard<std::mutex> lock(sequencesMutex);
    if (newTick == currentTick || sequences.empty()) {
        return;
    }

    Sequence& currentSequence = sequences.front();
    for (auto& action : currentSequence.actions) {
        // Ticks can be skipped, so run every action after the previous tick up to the new one.
        if (action.tick > newTick || action.tick <= currentTick) {
            continue;
        }

        if (action.cmd == "pause_playback") {
            Log("[%d] Pausing demo playback", newTick);
            engine->ExecuteClientCmd(0, "demo_pause", true);
            std::this_thread::sleep_for(std::chrono::milliseconds(2000));
            Log("[%d] Resuming demo playback", newTick);
            engine->ExecuteClientCmd(0, "demo_resume", true);
        } else if (action.cmd == "go_to_next_sequence") {
            Log("[%d] Going to next sequence, remaining sequences: %d", newTick, sequences.size() - 1);
            sequences.pop();
            engine->ExecuteClientCmd(0, "demo_gototick 0", true);
            currentTick = -1;
            break;
        } else {
            Log("[%d] Executing: %s", newTick, action.cmd.c_str());
            engine->ExecuteClientCmd(0, action.cmd.c_str(), true);
            Log("[%d] Executed: %s", newTick, action.cmd.c_str());
        }
    }
}
