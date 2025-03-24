import type { CompetitiveRankHistory } from 'csdm/common/types/charts/competitive-rank-history';
import type { PlayerChartsData } from 'csdm/common/types/charts/player-charts-data';
import type { Rank } from 'csdm/common/types/counter-strike';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { Clutch } from './clutch';
import type { PremierRankHistory } from './charts/premier-rank-history';
import type { LastMatch } from './last-match';
import type { MapStats } from './map-stats';
import type { Player } from './player';
import type { PlayerUtilityStats } from 'csdm/node/database/players/fetch-players-utility-stats';
import type { PlayerOpeningDuelsStats } from 'csdm/node/database/player/fetch-player-opening-duels-stats';

export type PlayerProfile = Player &
  PlayerUtilityStats & {
    openingDuelsStats: PlayerOpeningDuelsStats;
    clutches: Clutch[];
    enemyCountPerRank: Record<Rank, number>;
    competitiveRankHistory: CompetitiveRankHistory[];
    premierRankHistory: PremierRankHistory[];
    mapsStats: MapStats[];
    lastMatches: LastMatch[];
    matches: MatchTable[];
    chartsData: PlayerChartsData[];
    tagIds: string[];
  };
