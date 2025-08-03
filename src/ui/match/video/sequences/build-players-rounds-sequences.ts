import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';
import type { VideoSettings } from 'csdm/node/settings/settings';

type Options = {
  match: Match;
  steamIds: string[];
  rounds: number[];
  startSecondsBeforeEvent: number;
  endSecondsAfterEvent: number;
  settings: VideoSettings;
  firstSequenceNumber: number;
};

export function buildPlayersRoundsSequences({
  match,
  steamIds,
  rounds,
  startSecondsBeforeEvent,
  endSecondsAfterEvent,
  settings,
  firstSequenceNumber,
}: Options) {
  const sequences: Sequence[] = [];
  const startSecondsBeforeEventTick = startSecondsBeforeEvent;
  const endSecondsAfterEventTick = endSecondsAfterEvent;

  for (const steamId of steamIds) {
    for (const round of match.rounds) {
      if (rounds.length > 0 && !rounds.includes(round.number)) {
        continue;
      }
      const hasShot = match.shots.some((shot) => {
        return shot.roundNumber === round.number && shot.playerSteamId === steamId;
      });
      const playerDeath = match.kills.find((kill) => {
        return kill.roundNumber === round.number && kill.victimSteamId === steamId;
      });

      if (hasShot || playerDeath) {
        const endTick = playerDeath ? playerDeath.tick : round.endTick;
        const startTick = round.freezetimeEndTick - match.tickrate * startSecondsBeforeEventTick;

        sequences.push({
          number: firstSequenceNumber + sequences.length,
          startTick,
          endTick: endTick + match.tickrate * endSecondsAfterEventTick,
          showOnlyDeathNotices: settings.showOnlyDeathNotices,
          deathNoticesDuration: settings.deathNoticesDuration,
          showXRay: settings.showXRay,
          playerVoicesEnabled: settings.playerVoicesEnabled,
          playersOptions: [],
          cameras: [
            {
              tick: startTick,
              playerSteamId: steamId,
              playerName: match.players.find((player) => player.steamId === steamId)?.name ?? '',
            },
          ],
        });
      }
    }
  }

  return sequences;
}
