import { createAction } from '@reduxjs/toolkit';
import type { Match } from 'csdm/common/types/match';

export const fetchMatchSuccess = createAction<{ match: Match }>('match/fetchSuccess');
export const updateMatchDemoLocationSuccess = createAction<{ checksum: string; demoFilePath: string }>(
  'match/demoLocationUpdated',
);
