#pragma once

// The name the game shows for a player comes from its player controller, which the game fills again from the demo
// whenever it applies a network update. A replacement set here is written back into the controller on every frame so
// that it stays the name the scoreboard, the kill feed and the spectator HUD show. Game thread only.

// Shows `name` instead of the demo's name for the player `target` names, which is a player slot, a SteamID64 or the
// start of a player name, case-insensitive. A NULL `name` brings the demo's name back. What happened is logged, there
// is nothing else to report to the console.
void ReplacePlayerName(const char* target, const char* name);

// Writes the replacements back into the player controllers.
void ApplyReplacedPlayerNames();

// Forgets the replacements, the demo they were set for isn't playing anymore.
void ResetReplacedPlayerNames();

// Logs the replacements for csdm_info.
void LogReplacedPlayerNamesState();
