import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';
import type { RankingFilter } from 'csdm/common/types/ranking-filter';

export type MatchesTableFilter = {
  sources: DemoSource[];
  games: Game[];
  gameModes: GameMode[];
  demoTypes: DemoType[];
  tagIds: string[];
  ranking: RankingFilter;
  maxRounds: number[];
  startDate: string | undefined;
  endDate: string | undefined;
};
