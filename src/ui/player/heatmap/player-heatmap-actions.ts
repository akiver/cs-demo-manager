import { createAction } from '@reduxjs/toolkit';
import type { PlayerHeatmapFilter } from 'csdm/common/types/heatmap-filters';

export const radiusChanged = createAction<number>('player/heatmap/radiusChanged');
export const blurChanged = createAction<number>('player/heatmap/blurChanged');
export const opacityChanged = createAction<number>('player/heatmap/opacityChanged');
export const fetchPointsSuccess = createAction<PlayerHeatmapFilter>('player/heatmap/fetchPointsSuccess');
