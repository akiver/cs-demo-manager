import { createAction } from '@reduxjs/toolkit';
import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';
import type { ErrorCode } from 'csdm/common/error-code';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';

export const fetchLastMatchesStart = createAction('downloads/5eplay/fetchLastMatchesStart');
export const fetchLastMatchesSuccess = createAction<{ matches: FiveEPlayMatch[] }>(
  'downloads/5eplay/fetchLastMatchesSuccess',
);
export const fetchLastMatchesError = createAction<{ errorCode: ErrorCode }>('downloads/5eplay/fetchLastMatchesError');
export const accountAdded = createAction<{ account: FiveEPlayAccount }>('downloads/5eplay/accountAdded');
export const accountsUpdated = createAction<{ accounts: FiveEPlayAccount[] }>('downloads/5eplay/accountsUpdated');
export const matchSelected = createAction<{ matchId: string }>('downloads/5eplay/matchSelected');
