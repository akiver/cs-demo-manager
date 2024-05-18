import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';

export type FetchTeamFilters = {
  name: string;
  startDate: string | undefined;
  endDate: string | undefined;
  sources: DemoSource[];
  demoTypes: DemoType[];
  games: Game[];
  gameModes: GameMode[];
  tagIds: string[];
  maxRounds: number[];
};
