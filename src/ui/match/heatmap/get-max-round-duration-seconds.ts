import type { Match } from 'csdm/common/types/match';

// Duration of the longest selected round in whole seconds, it's the maximum of the heatmap time range slider.
// An empty selection means all rounds.
export function getMaxRoundDurationSeconds(match: Match, roundNumbers: number[]) {
  const rounds =
    roundNumbers.length > 0 ? match.rounds.filter((round) => roundNumbers.includes(round.number)) : match.rounds;
  const durations = rounds.map((round) => {
    return (round.endTick - round.freezetimeEndTick) / match.tickrate;
  });

  return Math.max(1, Math.ceil(Math.max(0, ...durations)));
}
