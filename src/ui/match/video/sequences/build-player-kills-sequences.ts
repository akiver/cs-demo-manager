import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';
import type { Player } from 'csdm/common/types/player';

function buildPlayersDeathNotices(players: Player[]) {
  const deathNotices: DeathNoticesPlayerOptions[] = players.map((player) => {
    return {
      highlightKill: false,
      playerName: player.name,
      showKill: true,
      steamId: player.steamId,
    };
  });

  return deathNotices;
}

const MINIMUM_SECONDS_BETWEEN_TWO_SEQUENCES = 2;
const MAX_SECONDS_BETWEEN_KILLS = 10;
const START_SECONDS_BEFORE_KILL = 5;
const END_SECONDS_AFTER_KILL = 2;

export function buildPlayerKillsSequences(match: Match, steamId: string) {
  const playerKills = match.kills.filter((kill) => kill.killerSteamId === steamId);
  if (playerKills.length === 0) {
    return [];
  }

  const deathNotices = buildPlayersDeathNotices(match.players);
  const sequences: Sequence[] = [];
  const ticksRequiredBetweenTwoSequences = Math.round(match.tickrate * MINIMUM_SECONDS_BETWEEN_TWO_SEQUENCES);
  const additionalTicksBeforeKill = Math.round(match.tickrate * START_SECONDS_BEFORE_KILL);
  const additionalTicksAfterKill = Math.round(match.tickrate * END_SECONDS_AFTER_KILL);
  const maxTicksBetweenKills = Math.round(match.tickrate * MAX_SECONDS_BETWEEN_KILLS);

  for (const [index, kill] of playerKills.entries()) {
    const sequenceStartTick = Math.max(1, kill.tick - additionalTicksBeforeKill);
    let sequenceEndTick = Math.min(match.tickCount, kill.tick + additionalTicksAfterKill);

    const nextKill = index < playerKills.length - 1 ? playerKills[index + 1] : undefined;
    if (nextKill !== undefined) {
      const isNextKillTooClose = kill.tick + maxTicksBetweenKills >= nextKill.tick;
      if (isNextKillTooClose) {
        sequenceEndTick = Math.min(match.tickCount, nextKill.tick + additionalTicksAfterKill);
      }
    }

    const previousSequence = sequences.length > 0 ? sequences[sequences.length - 1] : undefined;
    if (previousSequence !== undefined) {
      const areSequencesOverlapping = previousSequence.endTick + ticksRequiredBetweenTwoSequences >= sequenceStartTick;
      if (areSequencesOverlapping) {
        previousSequence.endTick = sequenceEndTick;
        continue;
      }
    }

    sequences.push({
      number: sequences.length + 1,
      startTick: sequenceStartTick,
      endTick: sequenceEndTick,
      deathNotices,
      playerFocusSteamId: steamId,
    });
  }

  return sequences;
}
