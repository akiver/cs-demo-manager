import { createAction } from '@reduxjs/toolkit';

export const commentUpdated = createAction<{ checksum: string; comment: string }>('comment/commentUpdated');
