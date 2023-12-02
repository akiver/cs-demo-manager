import type { PremierRank } from 'csdm/common/types/counter-strike';

export type PremierRankHistory = {
  matchDate: string;
  rank: PremierRank;
  winCount: number;
};
