import { createReducer } from '@reduxjs/toolkit';
import { initializeVideoSuccess } from 'csdm/ui/match/video/video-actions';
import { hlaeVersionChanged } from '../../../settings/settings-actions';
import { installHlaeSuccess, updateHlaeSuccess } from './hlae-actions';

export type HlaeState = {
  isUpdateAvailable: boolean;
  version?: string;
};

const initialState: HlaeState = {
  isUpdateAvailable: false,
};

export const hlaeReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(installHlaeSuccess, (state, action) => {
      state.version = action.payload.version;
      state.isUpdateAvailable = false;
    })
    .addCase(updateHlaeSuccess, (state, action) => {
      state.version = action.payload.version;
      state.isUpdateAvailable = false;
    })
    .addCase(initializeVideoSuccess, (state, action) => {
      state.version = action.payload.hlaeVersion;
      state.isUpdateAvailable = action.payload.hlaeUpdateAvailable;
    })
    .addCase(hlaeVersionChanged, (state, action) => {
      state.version = action.payload.version;
      state.isUpdateAvailable = action.payload.isUpdateAvailable;
    });
});
