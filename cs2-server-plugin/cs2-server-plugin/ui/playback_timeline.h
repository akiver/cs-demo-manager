#pragma once

#include <climits>
#include <cstdint>
#include <cstring>
#include <vector>

#include "playback_controls.h"

// Plain arrays so a kill can be handed to the Vulkan layer as is. Longer names are truncated.
constexpr int playbackTimelineNameSize = 32;
constexpr int playbackTimelineWeaponNameSize = 32;

struct TimelineKill {
    int tick;
    int killerTeam;
    int victimTeam;
    uint64_t killerSteamId;
    uint64_t victimSteamId;
    char killerName[playbackTimelineNameSize];
    char victimName[playbackTimelineNameSize];
    char weaponName[playbackTimelineWeaponNameSize];
    bool isHeadshot;
    bool isWallbang;
};

// The RoundEndReason values of @akiver/cs-demo-analyzer that the round tooltips name.
enum TimelineRoundEndReason {
    TIMELINE_ROUND_END_TARGET_BOMBED = 1,
    TIMELINE_ROUND_END_TERRORISTS_STOPPED = 6,
    TIMELINE_ROUND_END_BOMB_DEFUSED = 7,
    TIMELINE_ROUND_END_CT_WIN = 8,
    TIMELINE_ROUND_END_TERRORIST_WIN = 9,
    TIMELINE_ROUND_END_DRAW = 10,
    TIMELINE_ROUND_END_HOSTAGES_RESCUED = 11,
    TIMELINE_ROUND_END_TARGET_SAVED = 12,
    TIMELINE_ROUND_END_HOSTAGES_NOT_RESCUED = 13,
    TIMELINE_ROUND_END_TERRORISTS_SURRENDER = 17,
    TIMELINE_ROUND_END_CT_SURRENDER = 18,
};

enum TimelineEconomyType {
    TIMELINE_ECONOMY_UNKNOWN,
    TIMELINE_ECONOMY_PISTOL,
    TIMELINE_ECONOMY_ECO,
    TIMELINE_ECONOMY_SEMI,
    TIMELINE_ECONOMY_FORCE_BUY,
    TIMELINE_ECONOMY_FULL,
};

// The EconomyType values of @akiver/cs-demo-analyzer.
inline TimelineEconomyType ParseEconomyType(const char* economyType) {
    if (strcmp(economyType, "pistol") == 0) {
        return TIMELINE_ECONOMY_PISTOL;
    }
    if (strcmp(economyType, "eco") == 0) {
        return TIMELINE_ECONOMY_ECO;
    }
    if (strcmp(economyType, "semi") == 0) {
        return TIMELINE_ECONOMY_SEMI;
    }
    if (strcmp(economyType, "force-buy") == 0) {
        return TIMELINE_ECONOMY_FORCE_BUY;
    }
    if (strcmp(economyType, "full") == 0) {
        return TIMELINE_ECONOMY_FULL;
    }

    return TIMELINE_ECONOMY_UNKNOWN;
}

inline const char* GetRoundEndReasonText(int endReason) {
    switch (endReason) {
        case TIMELINE_ROUND_END_TARGET_BOMBED:
            return "Bomb exploded";
        case TIMELINE_ROUND_END_BOMB_DEFUSED:
            return "Bomb defused";
        case TIMELINE_ROUND_END_CT_WIN:
        case TIMELINE_ROUND_END_TERRORIST_WIN:
        case TIMELINE_ROUND_END_TERRORISTS_STOPPED:
            return "Elimination";
        case TIMELINE_ROUND_END_TARGET_SAVED:
        case TIMELINE_ROUND_END_HOSTAGES_NOT_RESCUED:
            return "Time ran out";
        case TIMELINE_ROUND_END_HOSTAGES_RESCUED:
            return "Hostages rescued";
        case TIMELINE_ROUND_END_TERRORISTS_SURRENDER:
        case TIMELINE_ROUND_END_CT_SURRENDER:
            return "Surrender";
        case TIMELINE_ROUND_END_DRAW:
            return "Draw";
        default:
            return NULL;
    }
}

inline const char* GetEconomyTypeText(TimelineEconomyType economyType) {
    switch (economyType) {
        case TIMELINE_ECONOMY_PISTOL:
            return "Pistol";
        case TIMELINE_ECONOMY_ECO:
            return "Eco";
        case TIMELINE_ECONOMY_SEMI:
            return "Semi buy";
        case TIMELINE_ECONOMY_FORCE_BUY:
            return "Force buy";
        case TIMELINE_ECONOMY_FULL:
            return "Full buy";
        default:
            return "";
    }
}

struct TimelineRoundTeam {
    char name[playbackTimelineNameSize];
    // The side the team plays the round on, 0 when unknown.
    int team;
    // Score when the round starts.
    int score;
    TimelineEconomyType economyType;
};

struct TimelineRound {
    int startTick;
    // 0 when the timeline file predates them.
    int freezeTimeEndTick;
    // When the round was won, before the time between rounds.
    int endTick;
    // The team number of the winner, 0 when the round has no winner.
    int winnerTeam;
    int endReason;
    TimelineRoundTeam teamA;
    TimelineRoundTeam teamB;
};

struct TimelineBombPlant {
    int tick;
    char site;
    uint64_t planterSteamId;
};

struct TimelineBombDefuse {
    int tick;
    char site;
    uint64_t defuserSteamId;
};

struct TimelineBombExplosion {
    int tick;
    char site;
};

// A highlight or lowlight of a player, as the app's highlights playback would play it: their kills (deaths for a
// lowlight), grouped when close to each other, with the app's delays before the first and after the last.
struct TimelineSequence {
    int startTick;
    int endTick;
    uint64_t steamId;
    int team;
    char playerName[playbackTimelineNameSize];
    // Kills or deaths, plus the heavy damages when the app includes them.
    int eventCount;
};

struct PlaybackTimeline {
    // How long the round clock runs once the freeze time ends, 0 when the timeline file predates it.
    int roundDurationSeconds;
    std::vector<TimelineRound> rounds;
    std::vector<TimelineKill> kills;
    std::vector<TimelineBombPlant> bombPlants;
    std::vector<TimelineBombDefuse> bombDefuses;
    std::vector<TimelineBombExplosion> bombExplosions;
    std::vector<TimelineSequence> highlights;
    std::vector<TimelineSequence> lowlights;
};

struct OverlayPlaybackTimeline {
    int roundDurationSeconds;
    int roundCount;
    const TimelineRound* rounds;
    int killCount;
    const TimelineKill* kills;
    int bombPlantCount;
    const TimelineBombPlant* bombPlants;
    int bombDefuseCount;
    const TimelineBombDefuse* bombDefuses;
    int bombExplosionCount;
    const TimelineBombExplosion* bombExplosions;
    int highlightCount;
    const TimelineSequence* highlights;
    int lowlightCount;
    const TimelineSequence* lowlights;
};

// Whether the player with that SteamID is the killer or the victim of the kill. Never true for a SteamID of 0: bots
// all share it, and it is what is passed when nobody is spectated.
inline bool IsKillOfPlayer(const TimelineKill& kill, uint64_t steamId) {
    return steamId != 0 && (kill.killerSteamId == steamId || kill.victimSteamId == steamId);
}

// The number of seconds before a kill to seek to.
constexpr int playbackKillLeadSeconds = 3;

inline int GetKillSeekTick(const TimelineKill& kill) {
    int tick = kill.tick - playbackKillLeadSeconds * playbackTickrate;

    return tick < 0 ? 0 : tick;
}

// Returns the kill to seek to for going to the next or previous kill from `tick`, or NULL if there is no such kill.
// When `killerSteamId` is not 0, only that player's kills count.
inline const TimelineKill* FindKillToSeekTo(const PlaybackTimeline& timeline, int tick, uint64_t killerSteamId,
                                            bool isNext) {
    // Kills whose seek tick is within a second of `tick` are skipped. Otherwise, right after seeking to a kill,
    // pressing previous would seek to that same kill again.
    int margin = playbackTickrate;
    const TimelineKill* bestKill = NULL;
    int bestTick = -1;
    for (const TimelineKill& kill : timeline.kills) {
        if (killerSteamId != 0 && kill.killerSteamId != killerSteamId) {
            continue;
        }

        int seekTick = GetKillSeekTick(kill);
        if (isNext) {
            if (seekTick > tick + margin && (bestKill == NULL || seekTick < bestTick)) {
                bestKill = &kill;
                bestTick = seekTick;
            }
        } else if (seekTick < tick - margin && seekTick > bestTick) {
            bestKill = &kill;
            bestTick = seekTick;
        }
    }

    return bestKill;
}

// Returns the highlight or lowlight to seek to for going to the next or previous one from `tick`, or NULL if there is
// none. When `steamId` is not 0, only that player's count.
inline const TimelineSequence* FindSequenceToSeekTo(const std::vector<TimelineSequence>& sequences, int tick,
                                                    uint64_t steamId, bool isNext) {
    // Sequences starting within a second of `tick` are skipped, for the same reason as in FindKillToSeekTo.
    int margin = playbackTickrate;
    const TimelineSequence* best = NULL;
    for (const TimelineSequence& sequence : sequences) {
        if (steamId != 0 && sequence.steamId != steamId) {
            continue;
        }

        if (isNext) {
            if (sequence.startTick > tick + margin && (best == NULL || sequence.startTick < best->startTick)) {
                best = &sequence;
            }
        } else if (sequence.startTick < tick - margin && (best == NULL || sequence.startTick > best->startTick)) {
            best = &sequence;
        }
    }

    return best;
}

// The round the tick falls in, 1 for the first. 0 before the first round starts or without rounds.
inline int RoundAtTick(const PlaybackTimeline& timeline, int tick) {
    int round = 0;
    int roundCount = (int)timeline.rounds.size();
    for (int i = 0; i < roundCount; i++) {
        if (timeline.rounds[i].startTick <= tick) {
            round = i + 1;
        }
    }

    return round;
}

// mp_c4timer of every official game mode, when the demo doesn't say.
constexpr int playbackDefaultBombTimerSeconds = 40;
// What the round clock runs for when neither the demo nor the timeline file says.
constexpr int playbackDefaultRoundDurationSeconds = 115;

// The round time the clock runs: the server convar of the demo when the game gave it, else what the timeline file says,
// else the default. Both are 0 while unknown.
inline int ResolveRoundDurationSeconds(int conVarSeconds, int timelineSeconds) {
    if (conVarSeconds > 0) {
        return conVarSeconds;
    }

    return timelineSeconds > 0 ? timelineSeconds : playbackDefaultRoundDurationSeconds;
}

inline int ResolveBombTimerSeconds(int conVarSeconds) {
    return conVarSeconds > 0 ? conVarSeconds : playbackDefaultBombTimerSeconds;
}

// The ticks the phases of a round span. The round runs from its start to the start of the next one (or the end of the
// demo): freeze time first, then the clock runs until the round is won, and the time between rounds follows.
struct RoundPhases {
    int startTick;
    int freezeTimeEndTick;
    // When the round was won, the start of the next round when unknown.
    int endTick;
    // The start of the next round, INT_MAX for the last one.
    int nextRoundStartTick;
    // -1 when the bomb wasn't planted.
    int bombPlantTick;
    // When the bomb exploded or was defused, the end of the round otherwise.
    int bombEndTick;
};

// `round` is 1-based and must exist.
inline RoundPhases GetRoundPhases(const PlaybackTimeline& timeline, int round) {
    const TimelineRound& timelineRound = timeline.rounds[round - 1];
    RoundPhases phases;
    phases.startTick = timelineRound.startTick;
    phases.nextRoundStartTick = round < (int)timeline.rounds.size() ? timeline.rounds[round].startTick : INT_MAX;
    phases.freezeTimeEndTick = timelineRound.freezeTimeEndTick;
    if (phases.freezeTimeEndTick < phases.startTick) {
        phases.freezeTimeEndTick = phases.startTick;
    } else if (phases.freezeTimeEndTick > phases.nextRoundStartTick) {
        phases.freezeTimeEndTick = phases.nextRoundStartTick;
    }
    phases.endTick =
        timelineRound.endTick > phases.freezeTimeEndTick && timelineRound.endTick < phases.nextRoundStartTick
            ? timelineRound.endTick
            : phases.nextRoundStartTick;

    phases.bombPlantTick = -1;
    for (const TimelineBombPlant& bombPlant : timeline.bombPlants) {
        if (bombPlant.tick >= phases.startTick && bombPlant.tick < phases.nextRoundStartTick &&
            (phases.bombPlantTick < 0 || bombPlant.tick < phases.bombPlantTick)) {
            phases.bombPlantTick = bombPlant.tick;
        }
    }
    phases.bombEndTick = phases.endTick;
    if (phases.bombPlantTick >= 0) {
        for (const TimelineBombExplosion& bombExplosion : timeline.bombExplosions) {
            if (bombExplosion.tick >= phases.bombPlantTick && bombExplosion.tick < phases.bombEndTick) {
                phases.bombEndTick = bombExplosion.tick;
            }
        }
        for (const TimelineBombDefuse& bombDefuse : timeline.bombDefuses) {
            if (bombDefuse.tick >= phases.bombPlantTick && bombDefuse.tick < phases.bombEndTick) {
                phases.bombEndTick = bombDefuse.tick;
            }
        }
    }

    return phases;
}

enum RoundClockPhase {
    // Counting down to the end of the freeze time.
    ROUND_CLOCK_FREEZE_TIME,
    // Counting down the round time.
    ROUND_CLOCK_LIVE,
    // Counting down to the explosion of the bomb.
    ROUND_CLOCK_BOMB,
};

// The round clock as the game shows it.
struct RoundClock {
    RoundClockPhase phase;
    int ticksLeft;
    // The clock stops when the round is won and when the bomb is defused, the value then stays until the next round.
    bool isStopped;
};

inline int GetRoundClockSeconds(const RoundClock& clock) {
    // Rounded up like the game does: the clock shows the full round time on the first tick and reaches zero on the
    // last.
    return (clock.ticksLeft + playbackTickrate - 1) / playbackTickrate;
}

// The round clock at `tick`, with the resolved round time and bomb timer in seconds. False before the first round or
// without rounds.
inline bool GetRoundClock(const PlaybackTimeline& timeline, int tick, int roundDurationSeconds, int bombTimerSeconds,
                          RoundClock* clock) {
    int round = RoundAtTick(timeline, tick);
    if (round == 0) {
        return false;
    }

    RoundPhases phases = GetRoundPhases(timeline, round);
    if (tick < phases.freezeTimeEndTick) {
        clock->phase = ROUND_CLOCK_FREEZE_TIME;
        clock->ticksLeft = phases.freezeTimeEndTick - tick;
        clock->isStopped = false;
        return true;
    }

    if (phases.bombPlantTick >= 0 && tick >= phases.bombPlantTick) {
        int stoppedTick = tick < phases.bombEndTick ? tick : phases.bombEndTick;
        int ticksLeft = phases.bombPlantTick + bombTimerSeconds * playbackTickrate - stoppedTick;
        clock->phase = ROUND_CLOCK_BOMB;
        clock->ticksLeft = ticksLeft < 0 ? 0 : ticksLeft;
        clock->isStopped = tick >= phases.bombEndTick;
        return true;
    }

    int stoppedTick = tick < phases.endTick ? tick : phases.endTick;
    int ticksLeft = roundDurationSeconds * playbackTickrate - (stoppedTick - phases.freezeTimeEndTick);
    clock->phase = ROUND_CLOCK_LIVE;
    clock->ticksLeft = ticksLeft < 0 ? 0 : ticksLeft;
    clock->isStopped = tick >= phases.endTick;

    return true;
}
