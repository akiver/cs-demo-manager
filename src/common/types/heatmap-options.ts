import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import type { Map } from 'csdm/common/types/map';

export type HeatmapFilter = {
  event: HeatmapEvent;
  rounds: number[];
  sides: TeamNumber[];
  steamIds: string[];
  teamNames: string[];
};

export type HeatmapOptions = HeatmapFilter & {
  checksum: string;
  map: Map;
};
