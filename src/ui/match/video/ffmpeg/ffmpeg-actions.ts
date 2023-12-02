import { createAction } from '@reduxjs/toolkit';

export const installFfmpegSuccess = createAction<{ version: string }>('match/video/ffmpeg/installSuccess');
export const updateFfmpegSuccess = createAction<{ version: string }>('match/video/ffmpeg/updateSuccess');
