#pragma once

#include <cstddef>
#include <cstdint>

#include "playback_panel.h"

// What the playback panel works out from its state and the timeline, with nothing drawn: who is spectated, which
// events the round timeline keeps, the players the arrows go through.

// The index in playbackSpeeds closest to `speed`, which may be any value when demo_timescale was set from the console.
int GetSpeedIndex(float speed);
void FormatSpeedLabel(char* label, size_t size, int speedIndex);

bool IsKillHighlighted(const PlaybackPanelState& state, const TimelineKill& kill);
// Whether the round timeline leaves out the events the spectated player has no part in. It shows everything when
// nobody is spectated.
bool IsRoundTimelineFiltered(const PlaybackPanelState& state);
// The player whose highlights and lowlights the arrows go through, 0 for everyone's.
uint64_t GetSequenceFilterSteamId(const PlaybackPanelState& state);
bool IsKillOnRoundTimeline(const PlaybackPanelState& state, const TimelineKill& kill);
bool IsBombPlantOnRoundTimeline(const PlaybackPanelState& state, const TimelineBombPlant& bombPlant);
bool IsBombDefuseOnRoundTimeline(const PlaybackPanelState& state, const TimelineBombDefuse& bombDefuse);

// NULL when no player has that slot.
const char* GetPlayerName(const PlaybackPanelState& state, int slot);
// NULL when nobody is spectated.
const char* GetSpectatedPlayerName(const PlaybackPanelState& state);
const char* GetRoundTeamName(const TimelineRoundTeam& team);
const char* GetRoundWinnerName(const TimelineRound& round);

// The menus group the players by team: CT, T, and the others (coaches and spectators).
constexpr int voiceMenuGroupCount = 3;
// The group of the players in neither team. It has no ALL/NONE buttons, it rarely has more than a coach.
constexpr int voiceMenuOthersGroup = 2;
bool IsPlayerInVoiceMenuGroup(const PlaybackPlayer& player, int group);

// The players the arrows of the players widget cycle through, in the order the players menu lists them: CT first,
// then T. Coaches and spectators are left out like in the menu. Returns how many slots were written.
int GetCyclablePlayerSlots(const PlaybackPanelState& state, int* slots);
// The slot of the alive player after (or before) the spectated one, wrapping around like the cameras do. From a camera
// or when nobody is spectated, the first (or last) alive player. -1 without alive players.
int GetAdjacentPlayerSlot(const PlaybackPanelState& state, bool isNext);

// The ticks the round being played spans, from its start to the start of the next round or the end of the demo.
// Before the first round, the span is everything before it. False without rounds or when the span is empty.
bool GetCurrentRoundSpan(const PlaybackPanelState& state, const PlaybackTimeline& timeline, int* round, int* startTick,
                         int* endTick);
