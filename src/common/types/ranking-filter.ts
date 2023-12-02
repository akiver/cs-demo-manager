export const RankingFilter = {
  All: 'all',
  Ranked: 'ranked',
  Unranked: 'unranked',
} as const;

export type RankingFilter = (typeof RankingFilter)[keyof typeof RankingFilter];
