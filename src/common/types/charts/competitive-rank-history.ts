import type { CompetitiveRank } from 'csdm/common/types/counter-strike';

export type CompetitiveRankHistory = {
  matchDate: string;
  oldRank: CompetitiveRank;
  rank: CompetitiveRank;
  winCount: number;
};
