#pragma once

// The game is launched with a csgo/gameinfo.gi patched to load the plugin, the original kept as gameinfo.gi.backup.
// Restores the original and deletes the backup.
void RestoreGameinfoFile();
