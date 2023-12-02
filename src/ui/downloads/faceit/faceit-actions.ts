import { createAction } from '@reduxjs/toolkit';
import type { FaceitAccount } from 'csdm/common/types/faceit-account';
import type { ErrorCode } from 'csdm/common/error-code';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';

export const fetchLastMatchesStart = createAction('downloads/faceit/fetchLastMatchesStart');
export const fetchLastMatchesSuccess = createAction<{ matches: FaceitMatch[] }>(
  'downloads/faceit/fetchLastMatchesSuccess',
);
export const fetchLastMatchesError = createAction<{ errorCode: ErrorCode }>('downloads/faceit/fetchLastMatchesError');
export const accountAdded = createAction<{ account: FaceitAccount }>('downloads/faceit/accountAdded');
export const accountsUpdated = createAction<{ accounts: FaceitAccount[] }>('downloads/faceit/accountsUpdated');
export const matchSelected = createAction<{ matchId: string }>('downloads/faceit/matchSelected');
