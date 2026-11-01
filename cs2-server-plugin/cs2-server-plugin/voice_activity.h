#pragma once

#include <cstdint>

// Tracks who is talking during demo playback.
// Everything here runs on the game thread, where the demo's packets are read.

void RecordVoicePacket(uint64_t steamId, int entityIndex);
bool IsPlayerTalking(uint64_t steamId, int slot, int currentTick);
// Forgets every recorded packet.
void ResetVoiceActivity();
// Logs when each player last talked.
void LogVoiceActivityState();
