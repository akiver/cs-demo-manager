import { createReducer } from '@reduxjs/toolkit';
import { initializeVideoSuccess } from 'csdm/ui/match/video/video-actions';
import { ffmpegVersionChanged } from 'csdm/ui/settings/settings-actions';
import { installFfmpegSuccess, updateFfmpegSuccess } from './ffmpeg-actions';
import type { FfmpegVersion } from 'csdm/node/video/ffmpeg/get-ffmpeg-version-from-executable';

export type FfmpegState = {
  isUpdateAvailable: boolean;
  version: FfmpegVersion | undefined;
};

const initialState: FfmpegState = {
  isUpdateAvailable: false,
  version: undefined,
};

export const ffmpegReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(installFfmpegSuccess, (state, action) => {
      state.version = action.payload.version;
      state.isUpdateAvailable = false;
    })
    .addCase(updateFfmpegSuccess, (state, action) => {
      state.version = action.payload.version;
      state.isUpdateAvailable = false;
    })
    .addCase(initializeVideoSuccess, (state, action) => {
      state.version = action.payload.ffmpegVersion;
      state.isUpdateAvailable = action.payload.ffmpegUpdateAvailable;
    })
    .addCase(ffmpegVersionChanged, (state, action) => {
      state.version = action.payload.version;
      state.isUpdateAvailable = action.payload.isUpdateAvailable;
    });
});
