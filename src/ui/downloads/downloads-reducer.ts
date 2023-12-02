import { combineReducers } from 'redux';
import { pendingDownloadsReducer } from 'csdm/ui/downloads/pending/pending-downloads-reducer';
import { faceitReducer } from 'csdm/ui/downloads/faceit/faceit-reducer';
import { valveReducer } from 'csdm/ui/downloads/valve/valve-reducer';

export const downloadsReducer = combineReducers({
  valve: valveReducer,
  faceit: faceitReducer,
  pending: pendingDownloadsReducer,
});
