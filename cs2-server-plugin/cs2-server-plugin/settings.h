#pragma once

// Keeps the overlay settings (convars and panel positions) across game sessions in a JSON file.
// Everything here runs on the game thread.

// Applies the saved settings.
void LoadSettings();

// Writes the settings when they changed since the last write. Called every frame, it only checks every few frames.
void UpdateSettingsFile();

// Writes the settings when they changed since the last write, without waiting for the next check.
void SaveSettings();
