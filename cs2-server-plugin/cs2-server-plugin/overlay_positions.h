#pragma once

// Writes the position of each panel into its convar when the two differ. Called every frame.
void UpdateOverlayPositionConVars();

// True while UpdateOverlayPositionConVars writes a convar.
bool IsMirroringOverlayPositions();
