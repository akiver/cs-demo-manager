import { combineReducers } from 'redux';
import { heatmapReducer } from 'csdm/ui/match/heatmap/heatmap-reducer';
import { entityReducer } from 'csdm/ui/match/entity-reducer';
import { videoReducer } from 'csdm/ui/match/video/video-reducer';
import { grenadesReducer } from './grenades/grenades-reducer';

export const matchReducer = combineReducers({
  entity: entityReducer,
  heatmap: heatmapReducer,
  video: videoReducer,
  grenades: grenadesReducer,
});
