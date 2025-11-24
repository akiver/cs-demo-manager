import type { DemoSource, DemoType, Game, GameMode, TeamNumber } from 'csdm/common/types/counter-strike';
import type { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import type { RadarLevel } from 'csdm/ui/maps/radar-level';
import type { PlayerResult } from './search/player-result';

export type MatchHeatmapFilter = {
  checksum: string;
  event: HeatmapEvent;
  rounds: number[];
  sides: TeamNumber[];
  steamIds: string[];
  teamNames: string[];
  radarLevel: RadarLevel;
  thresholdZ: number | null;
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
  radarLevel: RadarLevel;
  thresholdZ: number | null;
  players: PlayerResult[];
};

export type PlayerHeatmapFilter = {
  steamId: string;
  event: HeatmapEvent;
  games: Game[];
  mapName: string;
  demoTypes: DemoType[];
  startDate: string | undefined;
  endDate: string | undefined;
  gameModes: GameMode[];
  maxRounds: number[];
  sides: TeamNumber[];
  sources: DemoSource[];
  radarLevel: RadarLevel;
  thresholdZ: number | null;
  tagIds: string[];
};
