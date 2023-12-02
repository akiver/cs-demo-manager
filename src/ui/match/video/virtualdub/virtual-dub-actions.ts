import { createAction } from '@reduxjs/toolkit';

export const installVirtualDubSuccess = createAction<{ version: string }>('match/video/virtualDub/installSuccess');
