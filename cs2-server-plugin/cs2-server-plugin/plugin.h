#pragma once

#include <atomic>
#include <string>

#include "cdll_interfaces.h"
#include "interface.h"

inline CreateInterfaceFn factory = NULL;

inline std::string gameDirectory;

inline std::atomic<int> currentTick{-1};

inline bool isPlayingDemo = false;

inline std::atomic<bool> isPlaybackActive{false};

ISource2EngineToClient* GetEngine();

// Queues a console command to run on the game thread, the only one the engine can be called from, at the start of the
// next frame. Safe to call from any thread.
void QueueEngineCommand(const std::string& cmd);
