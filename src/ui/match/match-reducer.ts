import { combineReducers } from '@reduxjs/toolkit';
import { heatmapReducer } from 'csdm/ui/match/heatmap/heatmap-reducer';
import { entityReducer } from 'csdm/ui/match/entity-reducer';
import { videoReducer } from 'csdm/ui/match/video/video-reducer';
import { grenadesReducer } from './grenades/grenades-reducer';
import { viewer2DReducer } from './viewer-2d/viewer-2d-reducer';

export const matchReducer = combineReducers({
  entity: entityReducer,
  heatmap: heatmapReducer,
  video: videoReducer,
  grenades: grenadesReducer,
  viewer2D: viewer2DReducer,
});
