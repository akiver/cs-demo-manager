import type { CompetitiveRankHistory } from 'csdm/common/types/charts/competitive-rank-history';
import type { PlayerChartsData } from 'csdm/common/types/charts/player-charts-data';
import type { Rank, CompetitiveRank, PremierRank } from 'csdm/common/types/counter-strike';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { EconomyBan } from 'csdm/node/steam-web-api/steam-constants';
import type { Clutch } from './clutch';
import type { PremierRankHistory } from './charts/premier-rank-history';
import type { LastMatch } from './last-match';
import type { MapStats } from './map-stats';

export type PlayerProfile = {
  steamId: string;
  name: string;
  avatar: string;
  assistCount: number;
  averageDamagePerRound: number;
  averageDeathsPerRound: number;
  averageKillsPerRound: number;
  bombDefusedCount: number;
  bombPlantedCount: number;
  deathCount: number;
  firstDeathCount: number;
  firstKillCount: number;
  firstTradeDeathCount: number;
  firstTradeKillCount: number;
  fiveKillCount: number;
  fourKillCount: number;
  headshotCount: number;
  headshotPercentage: number;
  hostageRescuedCount: number;
  kast: number;
  hltvRating: number;
  hltvRating2: number;
  killCount: number;
  collateralKillCount: number;
  wallbangKillCount: number;
  killDeathRatio: number;
  lostMatchCount: number;
  matchCount: number;
  premierRank: PremierRank;
  competitiveRank: CompetitiveRank;
  winsCount: number;
  mvpCount: number;
  oneKillCount: number;
  roundCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
  score: number;
  threeKillCount: number;
  tiedMatchCount: number;
  tradeDeathCount: number;
  tradeKillCount: number;
  twoKillCount: number;
  utilityDamage: number;
  wonMatchCount: number;
  averageBlindTime: number;
  averageEnemiesFlashed: number;
  averageHeGrenadeDamage: number;
  averageSmokesThrownPerMatch: number;
  clutches: Clutch[];
  enemyCountPerRank: Record<Rank, number>;
  competitiveRankHistory: CompetitiveRankHistory[];
  premierRankHistory: PremierRankHistory[];
  mapsStats: MapStats[];
  lastMatches: LastMatch[];
  matches: MatchTable[];
  chartsData: PlayerChartsData[];
  vacBanCount: number;
  gameBanCount: number;
  lastBanDate: string | null;
  economyBan: EconomyBan;
  hasPrivateProfile: boolean;
  isCommunityBanned: boolean;
  comment: string;
  tagIds: string[];
};
