import type { DeathNoticesPlayerOptions } from 'csdm/common/types/death-notice-player-options';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';
import type { Player } from 'csdm/common/types/player';
import type { WeaponName } from 'csdm/common/types/counter-strike';
import { PlayerSequenceEvent } from './player-sequence-event';
import { Perspective } from 'csdm/common/types/perspective';

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

export function buildPlayerEventSequences(
  event: PlayerSequenceEvent,
  match: Match,
  steamId: string,
  perspective: string,
  startSecondsBeforeEvent: number,
  weapons?: WeaponName[],
) {
  if (event !== PlayerSequenceEvent.Kills && event !== PlayerSequenceEvent.Deaths) {
    throw new Error(`Unsupported player event: ${event}`);
  }

  const steamIdKey = event === PlayerSequenceEvent.Kills ? 'killerSteamId' : 'victimSteamId';
  let playerEvents = match.kills.filter((kill) => kill[steamIdKey] === steamId);
  if (weapons) {
    playerEvents = playerEvents.filter((kill) => {
      return weapons.includes(kill.weaponName);
    });
  }

  if (playerEvents.length === 0) {
    return [];
  }

  const minimumSecondsBetweenTwoEvents = 2;
  const maxSecondsBetweenEvents = 10;
  const endSecondsAfterEvent = 2;

  const deathNotices = buildPlayersDeathNotices(match.players);
  const sequences: Sequence[] = [];
  const ticksRequiredBetweenTwoSequences = Math.round(match.tickrate * minimumSecondsBetweenTwoEvents);
  const additionalTicksBeforeEvent = Math.round(match.tickrate * startSecondsBeforeEvent);
  const additionalTicksAfterEvent = Math.round(match.tickrate * endSecondsAfterEvent);
  const maxTicksBetweenEvents = Math.round(match.tickrate * maxSecondsBetweenEvents);

  for (const [index, action] of playerEvents.entries()) {
    let steamIdToFocus = steamId;
    if (event === PlayerSequenceEvent.Kills && perspective === Perspective.Enemy && action.victimSteamId) {
      steamIdToFocus = action.victimSteamId;
    } else if (event === PlayerSequenceEvent.Deaths && perspective === Perspective.Enemy && action.killerSteamId) {
      steamIdToFocus = action.killerSteamId;
    }
    const sequenceStartTick = Math.max(1, action.tick - additionalTicksBeforeEvent);
    let sequenceEndTick = Math.min(match.tickCount, action.tick + additionalTicksAfterEvent);

    const nextAction = index < playerEvents.length - 1 ? playerEvents[index + 1] : undefined;
    if (nextAction !== undefined) {
      const isNextActionTooClose = action.tick + maxTicksBetweenEvents >= nextAction.tick;
      if (isNextActionTooClose) {
        sequenceEndTick = Math.min(match.tickCount, nextAction.tick + additionalTicksAfterEvent);
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
      cameras: [
        {
          tick: sequenceStartTick,
          playerSteamId: steamIdToFocus,
          playerName: match.players.find((player) => player.steamId === steamId)?.name ?? '',
        },
      ],
      showXRay: false,
      playerVoicesEnabled: false,
    });
  }

  return sequences;
}
