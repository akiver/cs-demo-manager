import { Game } from 'csdm/common/types/counter-strike';
import type { Point } from 'csdm/common/types/point';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { createContext, useContext } from 'react';

type PartialFilter = Record<string, unknown>;

type HeatmapContextState<Filter extends PartialFilter> = {
  game: Game;
  radarLevel: RadarLevel;
  mapName: string;
  alpha: number;
  blur: number;
  radius: number;
  points: Point[];
  fetchPoints: (filter: Filter) => Promise<void>;
};

export const HeatmapContext = createContext<HeatmapContextState<PartialFilter>>({
  radius: 0,
  blur: 0,
  alpha: 0,
  mapName: '',
  radarLevel: RadarLevel.Upper,
  game: Game.CS2,
  points: [],
  fetchPoints: () => {
    throw new Error('fetchPoints not implemented');
  },
});

export function useHeatmapContext<Filter extends PartialFilter>() {
  return useContext(HeatmapContext) as HeatmapContextState<Filter>;
}
