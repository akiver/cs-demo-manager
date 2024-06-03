import { createAction } from '@reduxjs/toolkit';
import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';

export const fetchPointsSuccess = createAction<MatchHeatmapFilter>('match/heatmap/fetchPointsSuccess');
export const radiusChanged = createAction<number>('match/heatmap/radiusChanged');
export const blurChanged = createAction<number>('match/heatmap/blurChanged');
export const opacityChanged = createAction<number>('match/heatmap/opacityChanged');
