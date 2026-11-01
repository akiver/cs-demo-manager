#pragma once

#include <cstdint>

class CSVCMsg_UserCommands;

// Tracks the buttons every player presses from the user commands of the demo.
// Everything here runs on the game thread, where the engine unserializes the messages of a demo, so nothing needs a
// lock.

// Merges the buttons of the message's commands into the last known state of their player slots.
void HandleUserCommandsMessage(const CSVCMsg_UserCommands& message);

// Returns the last known InputBitMask_t value of the player slot, 0 when there is none.
uint64_t GetPlayerButtons(int playerSlot);

// Forgets the button states of the demo that was playing.
void ResetUserCommandsState();

// Logs the last known buttons of every player.
void LogUserCommandsState();
