import { createAction } from '@reduxjs/toolkit';
import type { TeamProfile } from 'csdm/common/types/team-profile';
import type { ErrorCode } from 'csdm/common/error-code';

export const fetchTeamStart = createAction('team/fetchStart');
export const fetchTeamSuccess = createAction<TeamProfile>('team/fetchSuccess');
export const fetchTeamError = createAction<{ errorCode: ErrorCode }>('team/fetchError');
export const selectedMatchesChanged = createAction<{ selectedChecksums: string[] }>('team/selectedMatchesChanged');
