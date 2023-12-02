import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';
import type { RankingFilter } from 'csdm/common/types/ranking-filter';

export type FetchPlayerFilters = {
  steamId: string;
  startDate: string | undefined;
  endDate: string | undefined;
  sources: DemoSource[];
  demoTypes: DemoType[];
  games: Game[];
  ranking: RankingFilter;
  gameModes: GameMode[];
  tagIds: string[];
  maxRounds: number[];
};
