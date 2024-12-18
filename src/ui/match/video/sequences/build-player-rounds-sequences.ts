import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';

export function buildPlayerRoundsSequences(
  match: Match,
  steamId: string,
  startSecondsBeforeEvent: number,
  endSecondsAfterEvent: number,
) {
  const sequences: Sequence[] = [];
  const startSecondsBeforeStartTick = startSecondsBeforeEvent;
  const endSecondsAfterEndTick = endSecondsAfterEvent;

  for (const round of match.rounds) {
    const hasShot = match.shots.some((shot) => {
      return shot.roundNumber === round.number && shot.playerSteamId === steamId;
    });
    const playerDeath = match.kills.find((kill) => {
      return kill.roundNumber === round.number && kill.victimSteamId === steamId;
    });

    if (hasShot || playerDeath) {
      const endTick = playerDeath ? playerDeath.tick : round.endTick;
      const startTick = round.freezetimeEndTick - match.tickrate * startSecondsBeforeStartTick;

      sequences.push({
        number: sequences.length + 1,
        startTick,
        endTick: endTick + match.tickrate * endSecondsAfterEndTick,
        showOnlyDeathNotices: true,
        deathNotices: [],
        cameras: [
          {
            tick: startTick,
            playerSteamId: steamId,
            playerName: match.players.find((player) => player.steamId === steamId)?.name ?? '',
          },
        ],
        showXRay: false,
        playerVoicesEnabled: false,
      });
    }
  }

  return sequences;
}
