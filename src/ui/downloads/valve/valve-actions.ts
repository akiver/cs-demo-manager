import { createAction } from '@reduxjs/toolkit';
import type { ErrorCode } from 'csdm/common/error-code';
import type { ValveMatch } from 'csdm/common/types/valve-match';

export const fetchLastMatchesStart = createAction('downloads/valve/fetchLastMatchesStart');
export const fetchLastMatchesSuccess = createAction<{ matches: ValveMatch[] }>(
  'downloads/valve/fetchLastMatchesSuccess',
);
export const fetchLastMatchesError = createAction<{ errorCode: ErrorCode }>('downloads/valve/fetchLastMatchesError');
export const currentSteamIdDetected = createAction<{ steamId: string }>('downloads/valve/currentSteamIdDetected');
export const matchSelected = createAction<{ matchId: string }>('downloads/valve/matchSelected');
export const steamIdSelected = createAction<{ steamId: string }>('downloads/valve/steamIdSelected');
