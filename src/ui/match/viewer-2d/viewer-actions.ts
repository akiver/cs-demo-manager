import { createAction } from '@reduxjs/toolkit';

export const focusedPlayerChanged = createAction<{ focusedPlayerId: string | undefined }>(
  'match/viewer/focusedPlayerChanged',
);
export const speedChanged = createAction<{ speed: number }>('match/viewer/speedChanged');
export const volumeChanged = createAction<{ volume: number }>('match/viewer/volumeChanged');
export const audioLoaded = createAction<{ audioFilePath: string; offsetSeconds: number }>('match/viewer/audioLoaded');
export const audioOffsetChanged = createAction<{ seconds: number }>('match/viewer/audioOffsetChanged');
export const resetAudioOffset = createAction('match/viewer/resetAudioOffset');
