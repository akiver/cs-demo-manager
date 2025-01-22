import { createReducer } from '@reduxjs/toolkit';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import { initializeVideoSuccess } from 'csdm/ui/match/video/video-actions';
import { defaultSettings } from 'csdm/node/settings/default-settings';
import { settingsUpdated } from './settings-actions';

export const settingsReducer = createReducer(defaultSettings, (builder) => {
  builder
    .addCase(settingsUpdated, (state, action) => {
      return action.payload.settings;
    })
    .addCase(initializeAppSuccess, (state, action) => {
      return action.payload.settings;
    })
    .addCase(initializeVideoSuccess, (state, action) => {
      state.video.outputFolderPath = action.payload.outputFolderPath;
    });
});
