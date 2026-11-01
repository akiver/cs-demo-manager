#pragma once

#include <string>

#include "cdll_interfaces.h"

// The actions file the app writes next to the demo (<demo>.dem.json): a queue of sequences, each a list of console
// commands to run at a tick. Not to be confused with the video sequences marked from the playback panel, which are in
// playback_sequence.cpp.

// Loads <demoPath>.json into the sequence queue.
void LoadSequencesFile(const std::string& demoPath);

// Number of sequences still queued.
int GetSequenceCount();

// Runs the actions of the current sequence whose tick falls in (currentTick, newTick].
void ProcessSequences(ISource2EngineToClient* engine, int newTick);
