import type { DemoSource, DemoType, Game, GameMode, TeamNumber } from 'csdm/common/types/counter-strike';
import type { HeatmapEvent } from 'csdm/common/types/heatmap-event';

export type MatchHeatmapFilter = {
  checksum: string;
  event: HeatmapEvent;
  rounds: number[];
  sides: TeamNumber[];
  steamIds: string[];
  teamNames: string[];
};

export type TeamHeatmapFilter = {
  demoTypes: DemoType[];
  endDate: string | undefined;
  event: HeatmapEvent;
  gameModes: GameMode[];
  games: Game[];
  mapName: string;
  maxRounds: number[];
  sides: TeamNumber[];
  sources: DemoSource[];
  startDate: string | undefined;
  tagIds: string[];
  teamName: string;
};
