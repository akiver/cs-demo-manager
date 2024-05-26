import { createAction } from '@reduxjs/toolkit';
import type { RadarLevel } from 'csdm/ui/maps/radar-level';
import type { TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';

export const radarLevelChanged = createAction<{ radarLevel: RadarLevel }>('team/heatmap/radarLevelChanged');
export const radiusChanged = createAction<number>('team/heatmap/radiusChanged');
export const blurChanged = createAction<number>('team/heatmap/blurChanged');
export const opacityChanged = createAction<number>('team/heatmap/opacityChanged');
export const fetchPointsSuccess = createAction<TeamHeatmapFilter>('team/heatmap/fetchPointsSuccess');
