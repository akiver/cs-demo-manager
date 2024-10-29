import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';

export function buildPlayerRoundsSequences(match: Match, steamId: string) {
  const sequences: Sequence[] = [];
  const endSecondsAfterEndTick = 2;

  for (const round of match.rounds) {
    const hasShot = match.shots.some((shot) => {
      return shot.roundNumber === round.number && shot.playerSteamId === steamId;
    });
    const playerDeath = match.kills.find((kill) => {
      return kill.roundNumber === round.number && kill.victimSteamId === steamId;
    });

    if (hasShot || playerDeath) {
      const endTick = playerDeath ? playerDeath.tick : round.endTick;

      sequences.push({
        number: sequences.length + 1,
        startTick: round.freezetimeEndTick,
        endTick: endTick + match.tickrate * endSecondsAfterEndTick,
        deathNotices: [],
        playerFocusSteamId: steamId,
        showXRay: false,
        playerVoicesEnabled: false,
      });
    }
  }

  return sequences;
}
