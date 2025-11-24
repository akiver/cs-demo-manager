import { createAction } from '@reduxjs/toolkit';

export const roundCommentUpdated = createAction<{ checksum: string; number: number; comment: string }>(
  'round/commentUpdated',
);
