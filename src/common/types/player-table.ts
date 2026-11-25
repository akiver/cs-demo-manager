import type { Rank, Game } from 'csdm/common/types/counter-strike';

export type PlayerTable = {
  steamId: string;
  name: string;
  game: Game;
  avatar: string | null;
  matchCount: number;
  killCount: number;
  assistCount: number;
  deathCount: number;
  headshotCount: number;
  mvpCount: number;
  headshotPercentage: number;
  utilityDamage: number;
  averageDamagePerRound: number;
  utilityDamagePerRound: number;
  rank: Rank;
  killDeathRatio: number;
  kast: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  lastMatchDate: string;
  lastBanDate: string | null;
  isCommunityBanned: boolean;
  isVacBanned: boolean;
  isGameBanned: boolean;
  hltvRating: number;
  hltvRating2: number;
  // Milliseconds, null when not available.
  averageTimeToDamage: number | null;
  averageTimeToKill: number | null;
  comment: string;
  tagIds: string[];
};
