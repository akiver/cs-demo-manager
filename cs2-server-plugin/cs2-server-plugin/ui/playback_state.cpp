#include "playback_state.h"

#include <algorithm>
#include <cmath>
#include <cstdio>

int GetSpeedIndex(float speed) {
    int index = 0;
    for (int i = 1; i < playbackSpeedCount; i++) {
        if (fabsf(playbackSpeeds[i] - speed) < fabsf(playbackSpeeds[index] - speed)) {
            index = i;
        }
    }

    return index;
}

void FormatSpeedLabel(char* label, size_t size, int speedIndex) {
    snprintf(label, size, "%gx", playbackSpeeds[speedIndex]);
}

bool IsKillHighlighted(const PlaybackPanelState& state, const TimelineKill& kill) {
    return state.spectatedSteamId == 0 || IsKillOfPlayer(kill, state.spectatedSteamId);
}

bool IsRoundTimelineFiltered(const PlaybackPanelState& state) {
    return state.isRoundTimelineSpectatedOnly && state.spectatedSteamId != 0;
}

uint64_t GetSequenceFilterSteamId(const PlaybackPanelState& state) {
    return IsRoundTimelineFiltered(state) ? state.spectatedSteamId : 0;
}

bool IsKillOnRoundTimeline(const PlaybackPanelState& state, const TimelineKill& kill) {
    return !IsRoundTimelineFiltered(state) || IsKillOfPlayer(kill, state.spectatedSteamId);
}

bool IsBombPlantOnRoundTimeline(const PlaybackPanelState& state, const TimelineBombPlant& bombPlant) {
    return !IsRoundTimelineFiltered(state) || bombPlant.planterSteamId == state.spectatedSteamId;
}

bool IsBombDefuseOnRoundTimeline(const PlaybackPanelState& state, const TimelineBombDefuse& bombDefuse) {
    return !IsRoundTimelineFiltered(state) || bombDefuse.defuserSteamId == state.spectatedSteamId;
}

const char* GetPlayerName(const PlaybackPanelState& state, int slot) {
    int playerCount = std::clamp(state.playerCount, 0, playbackMaxPlayers);
    for (int i = 0; i < playerCount; i++) {
        if (state.players[i].slot == slot) {
            return state.players[i].name;
        }
    }

    return NULL;
}

static bool IsPlayerAlive(const PlaybackPanelState& state, int slot) {
    int playerCount = std::clamp(state.playerCount, 0, playbackMaxPlayers);
    for (int i = 0; i < playerCount; i++) {
        if (state.players[i].slot == slot) {
            return state.players[i].isAlive;
        }
    }

    return false;
}

const char* GetSpectatedPlayerName(const PlaybackPanelState& state) {
    return state.spectatedSteamId == 0 ? NULL : GetPlayerName(state, state.spectatedSlot);
}

const char* GetRoundTeamName(const TimelineRoundTeam& team) {
    if (team.name[0] != '\0') {
        return team.name;
    }

    return team.team == playbackTeamCT ? "Counter-Terrorists" : "Terrorists";
}

const char* GetRoundWinnerName(const TimelineRound& round) {
    if (round.teamA.team == round.winnerTeam) {
        return GetRoundTeamName(round.teamA);
    }
    if (round.teamB.team == round.winnerTeam) {
        return GetRoundTeamName(round.teamB);
    }

    return round.winnerTeam == playbackTeamCT ? "Counter-Terrorists" : "Terrorists";
}

bool IsPlayerInVoiceMenuGroup(const PlaybackPlayer& player, int group) {
    if (group == 0) {
        return player.team == playbackTeamCT;
    }

    if (group == 1) {
        return player.team == playbackTeamT;
    }

    return player.team != playbackTeamCT && player.team != playbackTeamT;
}

int GetCyclablePlayerSlots(const PlaybackPanelState& state, int* slots) {
    int playerCount = std::clamp(state.playerCount, 0, playbackMaxPlayers);
    int count = 0;
    for (int group = 0; group < voiceMenuOthersGroup; group++) {
        for (int i = 0; i < playerCount; i++) {
            if (IsPlayerInVoiceMenuGroup(state.players[i], group)) {
                slots[count++] = state.players[i].slot;
            }
        }
    }

    return count;
}

int GetAdjacentPlayerSlot(const PlaybackPanelState& state, bool isNext) {
    int slots[playbackMaxPlayers];
    int count = GetCyclablePlayerSlots(state, slots);
    if (count == 0) {
        return -1;
    }

    int currentIndex = -1;
    if (state.currentCameraIndex < 0) {
        for (int i = 0; i < count; i++) {
            if (slots[i] == state.spectatedSlot) {
                currentIndex = i;
                break;
            }
        }
    }
    // Starting one step before the first (or after the last) player makes the walk below begin on it.
    if (currentIndex < 0) {
        currentIndex = isNext ? count - 1 : 0;
    }

    // Dead players are skipped, spec_player ignores them and the arrow would get stuck on the spectated player.
    int step = isNext ? 1 : count - 1;
    for (int i = 1; i <= count; i++) {
        int slot = slots[(currentIndex + step * i) % count];
        if (IsPlayerAlive(state, slot)) {
            return slot;
        }
    }

    return -1;
}

bool GetCurrentRoundSpan(const PlaybackPanelState& state, const PlaybackTimeline& timeline, int* round, int* startTick,
                         int* endTick) {
    int roundCount = (int)timeline.rounds.size();
    if (roundCount == 0) {
        return false;
    }

    *round = RoundAtTick(timeline, state.tick);
    *startTick = *round > 0 ? timeline.rounds[*round - 1].startTick : 0;
    *endTick = *round < roundCount ? timeline.rounds[*round].startTick : state.totalTicks;

    return *endTick > *startTick;
}
