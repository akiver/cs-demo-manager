import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';

export type TeamFilters = {
  name: string;
  startDate: string | undefined;
  endDate: string | undefined;
  demoSources: DemoSource[];
  demoTypes: DemoType[];
  games: Game[];
  gameModes: GameMode[];
  tagIds: string[];
  maxRounds: number[];
};
