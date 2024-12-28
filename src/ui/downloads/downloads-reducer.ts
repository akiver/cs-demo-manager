import { combineReducers } from '@reduxjs/toolkit';
import { pendingDownloadsReducer } from 'csdm/ui/downloads/pending/pending-downloads-reducer';
import { faceitReducer } from 'csdm/ui/downloads/faceit/faceit-reducer';
import { valveReducer } from 'csdm/ui/downloads/valve/valve-reducer';
import { fiveEPlayReducer } from './five-eplay/5eplay-reducer';

export const downloadsReducer = combineReducers({
  valve: valveReducer,
  faceit: faceitReducer,
  '5eplay': fiveEPlayReducer,
  pending: pendingDownloadsReducer,
});
