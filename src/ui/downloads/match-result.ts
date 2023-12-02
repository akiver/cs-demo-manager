export const MatchResult = {
  Unplayed: 'unplayed', // The current Steam/third party provider account is not in the match
  Defeat: 'defeat',
  Victory: 'victory',
  Tied: 'tied',
} as const;

export type MatchResult = (typeof MatchResult)[keyof typeof MatchResult];
