#pragma once

#include <cstdint>

// Which players are heard is set by the tv_listen_voice_indices and tv_listen_voice_indices_h convars: a bit per
// player slot, the first convar for slots 0 to 31 and the second for 32 to 63, -1 for everyone. The playback panel
// reads them back so its checkboxes follow changes made from the console or by a sequence.

// Hands the convars and the players of the demo to the playback panel and the voice indicator while they are visible.
// Game thread only.
void UpdatePlayerVoicesState();

// Forgets the players of the demo and clears them from the playback panel and the voice indicator. Game thread only.
void ResetPlayerVoicesState();

// Sets the convars to `maskLow`/`maskHigh`. Safe to call from any thread.
void SetListenVoiceMask(uint32_t maskLow, uint32_t maskHigh);

// Returns false when the convars can't be read. Game thread only.
bool ReadListenVoiceMask(uint32_t* maskLow, uint32_t* maskHigh);

// Mutes or unmutes the players named by `targets`. A target is "all", "ct", "t", "others", a player slot, a SteamID64
// or the start of a player name, case-insensitive.
void SetPlayerVoicesMuted(int targetCount, const char** targets, bool muted);
