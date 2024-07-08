export const PlayerSequenceEvent = {
  Kills: 'kills',
  Deaths: 'deaths',
  Rounds: 'rounds',
} as const;
export type PlayerSequenceEvent = (typeof PlayerSequenceEvent)[keyof typeof PlayerSequenceEvent];
