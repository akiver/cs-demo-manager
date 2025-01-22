import { createAction } from '@reduxjs/toolkit';

export const initializeVideoSuccess = createAction<{
  hlaeVersion: string | undefined;
  hlaeUpdateAvailable: boolean;
  virtualDubVersion: string | undefined;
  ffmpegVersion: string | undefined;
  ffmpegUpdateAvailable: boolean;
  outputFolderPath: string;
}>('match/video/initializationSuccess');
