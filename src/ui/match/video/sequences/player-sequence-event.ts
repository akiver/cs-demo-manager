export const PlayerSequenceEvent = {
  Kills: 'kills',
  Rounds: 'rounds',
} as const;
export type PlayerSequenceEvent = (typeof PlayerSequenceEvent)[keyof typeof PlayerSequenceEvent];
