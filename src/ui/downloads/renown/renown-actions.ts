import { createAction } from '@reduxjs/toolkit';
import type { ErrorCode } from 'csdm/common/error-code';
import type { RenownMatch } from 'csdm/common/types/renown-match';
import type { RenownAccount } from 'csdm/common/types/renown-account';

export const fetchLastMatchesStart = createAction('downloads/renown/fetchLastMatchesStart');
export const fetchLastMatchesSuccess = createAction<{ matches: RenownMatch[] }>(
  'downloads/renown/fetchLastMatchesSuccess',
);
export const fetchLastMatchesError = createAction<{ errorCode: ErrorCode }>('downloads/renown/fetchLastMatchesError');
export const accountAdded = createAction<{ account: RenownAccount }>('downloads/renown/accountAdded');
export const accountsUpdated = createAction<{ accounts: RenownAccount[] }>('downloads/renown/accountsUpdated');
export const matchSelected = createAction<{ matchId: string }>('downloads/renown/matchSelected');
