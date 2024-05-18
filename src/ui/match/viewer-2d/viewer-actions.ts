import { createAction } from '@reduxjs/toolkit';

export const focusedPlayerChanged = createAction<{ focusedPlayerId: string | undefined }>(
  'match/viewer/focusedPlayerChanged',
);
export const speedChanged = createAction<{ speed: number }>('match/viewer/speedChanged');
