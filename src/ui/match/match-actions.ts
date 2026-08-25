import { createAction } from '@reduxjs/toolkit';
import type { Match } from 'csdm/common/types/match';
import type { ErrorCode } from 'csdm/common/error-code';

export const fetchMatchStart = createAction('match/fetchStart');
export const fetchMatchSuccess = createAction<{ match: Match }>('match/fetchSuccess');
export const fetchMatchError = createAction<{ errorCode: ErrorCode }>('match/fetchError');
export const updateMatchDemoLocationSuccess = createAction<{ checksum: string; demoFilePath: string }>(
  'match/demoLocationUpdated',
);
