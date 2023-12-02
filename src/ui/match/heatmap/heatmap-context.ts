import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import type { HeatmapFilter } from 'csdm/common/types/heatmap-options';
import { createContext, useContext } from 'react';

export type HeatmapDrawOptions = {
  radius: number;
  blur: number;
  alpha: number;
};

type HeatmapContextState = {
  canvasSize: number;
  setCanvasSize: (size: number) => void;
  setRadarCanvas: (canvas: HTMLCanvasElement) => void;
  setHeatmapCanvas: (canvas: HTMLCanvasElement) => void;
  buildImageBase64: () => string;
  fetchPointsAndDraw: (filters: Partial<HeatmapFilter>) => void;
  draw: (options?: Partial<HeatmapDrawOptions>) => void;
  radius: number;
  blur: number;
  alpha: number;
  event: HeatmapEvent;
  rounds: number[];
  sides: TeamNumber[];
  steamIds: string[];
  teamNames: string[];
};

export const HeatmapContext = createContext<HeatmapContextState>({
  canvasSize: 0,
  radius: 0,
  blur: 0,
  alpha: 0,
  event: HeatmapEvent.Kills,
  rounds: [],
  sides: [],
  steamIds: [],
  teamNames: [],
  setCanvasSize: () => {
    throw new Error('setCanvasSize not implemented');
  },
  setRadarCanvas: () => {
    throw new Error('setRadarCanvas not implemented');
  },
  setHeatmapCanvas: () => {
    throw new Error('setHeatmapCanvas not implemented');
  },
  buildImageBase64: () => {
    throw new Error('buildImageBase64 not implemented');
  },
  fetchPointsAndDraw: () => {
    throw new Error('fetchPointsAndDraw not implemented');
  },
  draw: () => {
    throw new Error('draw not implemented');
  },
});

export function useHeatmapContext() {
  return useContext(HeatmapContext);
}
