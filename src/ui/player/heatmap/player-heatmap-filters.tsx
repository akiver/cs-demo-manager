import React from 'react';
import { ExportHeatmapButton } from 'csdm/ui/components/heatmap/export-heatmap-button';
import { HeatmapInputRadius } from 'csdm/ui/components/heatmap/input-radius';
import { HeatmapInputBlur } from 'csdm/ui/components/heatmap/input-blur';
import { HeatmapInputOpacity } from 'csdm/ui/components/heatmap/heatmap-input-opacity';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { blurChanged, opacityChanged, radiusChanged } from 'csdm/ui/player/heatmap/player-heatmap-actions';
import { RadarLevelSelect } from 'csdm/ui/components/inputs/select/radar-level-select';
import { useHeatmapContext } from 'csdm/ui/components/heatmap/heatmap-context';
import { HeatmapSideSelect } from 'csdm/ui/components/heatmap/heatmap-side-select';
import { useHeatmapState } from './use-heatmap-state';
import { HeatmapSelectEvent } from 'csdm/ui/components/heatmap/heatmap-select-event';
import type { PlayerHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { HeatmapFilters } from 'csdm/ui/components/heatmap/heatmap-filters';
import { usePlayer } from '../use-player';
import { HeatmapSelectMap } from 'csdm/ui/components/heatmap/heatmap-select-map';
import { ResetZoomButton } from 'csdm/ui/components/heatmap/reset-zoom-button';

export function PlayerHeatmapFilters() {
  const dispatch = useDispatch();
  const { mapName, game, radarLevel, fetchPoints } = useHeatmapContext<Partial<PlayerHeatmapFilter>>();
  const { sides, event } = useHeatmapState();
  const { mapsStats } = usePlayer();
  const mapNames = mapsStats.map(({ mapName }) => {
    return mapName;
  });

  return (
    <HeatmapFilters>
      <HeatmapInputRadius
        onChange={(radius) => {
          dispatch(radiusChanged(radius));
        }}
      />
      <HeatmapInputBlur
        onChange={(blur) => {
          dispatch(blurChanged(blur));
        }}
      />
      <HeatmapInputOpacity
        onChange={(opacity) => {
          dispatch(opacityChanged(opacity));
        }}
      />
      <HeatmapSelectMap mapNames={mapNames} />
      <HeatmapSelectEvent
        event={event}
        onChange={(event) => {
          fetchPoints({ event });
        }}
      />
      <RadarLevelSelect
        mapName={mapName}
        game={game}
        onChange={(radarLevel) => {
          fetchPoints({ radarLevel });
        }}
        selectedRadarLevel={radarLevel}
      />
      <HeatmapSideSelect
        sides={sides}
        onChange={(sides) => {
          fetchPoints({ sides });
        }}
      />
      <div className="flex flex-wrap gap-x-8">
        <ResetZoomButton />
        <ExportHeatmapButton />
      </div>
    </HeatmapFilters>
  );
}
