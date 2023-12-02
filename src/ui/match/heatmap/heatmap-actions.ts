import { createAction } from '@reduxjs/toolkit';
import type { RadarLevel } from 'csdm/ui/maps/radar-level';
import type { HeatmapFilter } from 'csdm/common/types/heatmap-options';
import type { HeatmapDrawOptions } from './heatmap-context';

export const fetchPointsSuccess = createAction<HeatmapFilter>('match/heatmap/fetchPointsSuccess');
export const drawDone = createAction<HeatmapDrawOptions>('match/heatmap/drawDone');
export const radarLevelChanged = createAction<{ radarLevel: RadarLevel }>('match/heatmap/radarLevelChanged');
