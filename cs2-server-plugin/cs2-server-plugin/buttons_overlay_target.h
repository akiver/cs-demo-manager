#pragma once

#include <cstdint>

// Called every frame with the current demo tick: points the buttons overlay at the spectated player.
void UpdateButtonsOverlayTarget(int tick);

// Shows `buttons` when `playerSlot` is the one the overlay points at.
void OnPlayerButtonsChanged(int playerSlot, uint64_t buttons);

// Clears the overlay target and forgets the players of the demo that was playing.
void ResetButtonsOverlayTarget();

void LogButtonsOverlayTargetState();
