import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';
import type { VideoSettings } from 'csdm/node/settings/settings';
import { buildPlayersOptions } from './build-players-options';

type Options = {
  match: Match;
  steamIds: string[];
  rounds: number[];
  startSecondsBeforeEvent: number;
  endSecondsAfterEvent: number;
  settings: Pick<
    VideoSettings,
    'showOnlyDeathNotices' | 'deathNoticesDuration' | 'showXRay' | 'showAssists' | 'recordAudio' | 'playerVoicesEnabled'
  >;
  firstSequenceNumber: number;
  // Steam IDs of the players whose voices must be heard, falls back to the "player voices" setting when undefined.
  voiceSteamIds?: string[];
};

export function buildPlayersRoundsSequences({
  match,
  steamIds,
  rounds,
  startSecondsBeforeEvent,
  endSecondsAfterEvent,
  settings,
  firstSequenceNumber,
  voiceSteamIds,
}: Options) {
  const sequences: Sequence[] = [];
  const playersOptions = buildPlayersOptions({
    players: match.players,
    highlightedSteamIds: steamIds,
    voiceSteamIds,
    playerVoicesEnabled: settings.playerVoicesEnabled,
  });
  const playerVoicesEnabled = playersOptions.some((options) => options.isVoiceEnabled);
  const startSecondsBeforeEventTick = startSecondsBeforeEvent;
  const endSecondsAfterEventTick = endSecondsAfterEvent;

  for (const steamId of steamIds) {
    for (const round of match.rounds) {
      if (rounds.length > 0 && !rounds.includes(round.number)) {
        continue;
      }
      const playerDeath = match.kills.find((kill) => {
        return kill.roundNumber === round.number && kill.victimSteamId === steamId;
      });
      const endTick = playerDeath ? playerDeath.tick : round.endTick;
      const startTick = round.freezetimeEndTick - match.tickrate * startSecondsBeforeEventTick;

      sequences.push({
        number: firstSequenceNumber + sequences.length,
        startTick,
        endTick: endTick + match.tickrate * endSecondsAfterEventTick,
        showOnlyDeathNotices: settings.showOnlyDeathNotices,
        deathNoticesDuration: settings.deathNoticesDuration,
        showXRay: settings.showXRay,
        showAssists: settings.showAssists,
        recordAudio: settings.recordAudio,
        playerVoicesEnabled,
        playersOptions,
        playerCameras: [
          {
            tick: startTick,
            playerSteamId: steamId,
            playerName: match.players.find((player) => player.steamId === steamId)?.name ?? '',
          },
        ],
        cameras: [],
      });
    }
  }

  return sequences;
}
