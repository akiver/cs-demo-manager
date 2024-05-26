import React, { type ReactNode } from 'react';
import { HeatmapContext } from './heatmap-context';
import type { Point } from 'csdm/common/types/point';
import type { RadarLevel } from 'csdm/ui/maps/radar-level';
import type { Game } from 'csdm/common/types/counter-strike';

type Props = {
  mapName: string;
  game: Game;
  radarLevel: RadarLevel;
  alpha: number;
  blur: number;
  radius: number;
  points: Point[];
  fetchPoints: () => Promise<void>;
  children: ReactNode;
};

export function HeatmapProvider({
  alpha,
  blur,
  children,
  fetchPoints,
  game,
  mapName,
  points,
  radarLevel,
  radius,
}: Props) {
  return (
    <HeatmapContext.Provider
      value={{
        alpha,
        blur,
        fetchPoints,
        game,
        mapName,
        points,
        radarLevel,
        radius,
      }}
    >
      {children}
    </HeatmapContext.Provider>
  );
}
