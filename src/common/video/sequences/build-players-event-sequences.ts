import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';
import type { MatchPlayer } from 'csdm/common/types/match-player';
import type { WeaponName } from 'csdm/common/types/counter-strike';
import { PlayerSequenceEvent } from 'csdm/common/types/player-sequence-event';
import { Perspective } from 'csdm/common/types/perspective';
import type { VideoSettings } from 'csdm/node/settings/settings';
import type { Kill } from 'csdm/common/types/kill';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

function buildPlayersOptions(players: MatchPlayer[], targetSteamIds: string[]) {
  const options: SequencePlayerOptions[] = players.map((player) => {
    return {
      highlightKill: targetSteamIds.includes(player.steamId),
      playerName: player.name,
      showKill: true,
      steamId: player.steamId,
      isVoiceEnabled: true,
    };
  });

  return options;
}

type PlayerEventType = typeof PlayerSequenceEvent.Kills | typeof PlayerSequenceEvent.Deaths;

type Options = {
  event: PlayerEventType;
  match: Match;
  steamIds: string[];
  rounds: number[];
  perspective: Perspective;
  weapons: WeaponName[];
  settings: Pick<
    VideoSettings,
    'showOnlyDeathNotices' | 'deathNoticesDuration' | 'showXRay' | 'showAssists' | 'recordAudio' | 'playerVoicesEnabled'
  >;
  startSecondsBeforeEvent: number;
  endSecondsAfterEvent: number;
  firstSequenceNumber: number;
};

function getSteamIdToFocus(
  kill: Kill,
  steamIdKey: 'killerSteamId' | 'victimSteamId',
  event: PlayerEventType,
  perspective: Perspective,
) {
  let cameraFocusSteamId = kill[steamIdKey];
  if (event === PlayerSequenceEvent.Kills && perspective === Perspective.Enemy && kill.victimSteamId) {
    cameraFocusSteamId = kill.victimSteamId;
  } else if (event === PlayerSequenceEvent.Deaths && perspective === Perspective.Enemy && kill.killerSteamId) {
    cameraFocusSteamId = kill.killerSteamId;
  }

  return cameraFocusSteamId;
}

export function buildPlayersEventSequences({
  event,
  match,
  steamIds,
  rounds,
  perspective,
  weapons,
  settings,
  startSecondsBeforeEvent,
  endSecondsAfterEvent,
  firstSequenceNumber,
}: Options) {
  const steamIdKey = event === PlayerSequenceEvent.Kills ? 'killerSteamId' : 'victimSteamId';
  let playerEvents = match.kills.filter((kill) => {
    if (rounds.length > 0 && !rounds.includes(kill.roundNumber)) {
      return false;
    }
    return steamIds.includes(kill[steamIdKey]);
  });
  if (weapons.length > 0) {
    playerEvents = playerEvents.filter((kill) => {
      return weapons.includes(kill.weaponName);
    });
  }

  if (playerEvents.length === 0) {
    return [];
  }

  const minimumSecondsBetweenTwoEvents = 2;
  const maxSecondsBetweenEvents = 10;

  const playersOptions = buildPlayersOptions(match.players, steamIds);
  const sequences: Sequence[] = [];
  const ticksRequiredBetweenTwoSequences = Math.round(match.tickrate * minimumSecondsBetweenTwoEvents);
  const additionalTicksBeforeEvent = Math.round(match.tickrate * startSecondsBeforeEvent);
  const additionalTicksAfterEvent = Math.round(match.tickrate * endSecondsAfterEvent);
  const maxTicksBetweenEvents = Math.round(match.tickrate * maxSecondsBetweenEvents);

  for (const [index, kill] of playerEvents.entries()) {
    const steamIdToFocus = getSteamIdToFocus(kill, steamIdKey, event, perspective);
    const sequenceStartTick = Math.max(1, kill.tick - additionalTicksBeforeEvent);
    let sequenceEndTick = Math.min(match.tickCount, kill.tick + additionalTicksAfterEvent);
    const nextKill = index < playerEvents.length - 1 ? playerEvents[index + 1] : undefined;
    if (nextKill !== undefined) {
      const isNextKillTooClose = kill.tick + maxTicksBetweenEvents >= nextKill.tick;
      if (isNextKillTooClose) {
        sequenceEndTick = Math.min(match.tickCount, nextKill.tick + additionalTicksAfterEvent);
      }
    }

    const previousSequence = sequences.length > 0 ? lastArrayItem(sequences) : undefined;
    if (previousSequence !== undefined) {
      const areSequencesOverlapping = previousSequence.endTick + ticksRequiredBetweenTwoSequences >= sequenceStartTick;
      if (areSequencesOverlapping) {
        previousSequence.endTick = sequenceEndTick;
        // add camera focus at the midpoint between the previous and current kill events to the previous sequence
        const cameraFocusSteamId = getSteamIdToFocus(kill, steamIdKey, event, perspective);
        const previousKill = playerEvents[index - 1];
        const previousKillTick = previousKill.tick;
        const midpointTick = Math.round((previousKillTick + kill.tick) / 2);
        previousSequence.playerCameras.push({
          tick: midpointTick,
          playerSteamId: cameraFocusSteamId,
          playerName: match.players.find((player) => player.steamId === cameraFocusSteamId)?.name ?? '',
        });
        continue;
      }
    }

    sequences.push({
      number: firstSequenceNumber + sequences.length,
      startTick: sequenceStartTick,
      endTick: sequenceEndTick,
      showOnlyDeathNotices: settings.showOnlyDeathNotices,
      deathNoticesDuration: settings.deathNoticesDuration,
      showXRay: settings.showXRay,
      showAssists: settings.showAssists,
      recordAudio: settings.recordAudio,
      playerVoicesEnabled: settings.playerVoicesEnabled,
      playersOptions,
      playerCameras: [
        {
          tick: sequenceStartTick,
          playerSteamId: steamIdToFocus,
          playerName: match.players.find((player) => player.steamId === steamIdToFocus)?.name ?? '',
        },
      ],
      cameras: [],
    });
  }

  return sequences;
}
