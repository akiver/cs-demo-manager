import { createAction } from '@reduxjs/toolkit';

export const installHlaeSuccess = createAction<{ version: string }>('match/video/hlae/installSuccess');
export const updateHlaeSuccess = createAction<{ version: string }>('match/video/hlae/updateSuccess');
