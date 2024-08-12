import { createAction } from '@reduxjs/toolkit';
import type { PlayerProfile } from 'csdm/common/types/player-profile';
import type { ErrorCode } from 'csdm/common/error-code';
import type { UpdateSteamAccountNamePayload } from 'csdm/server/handlers/renderer-process/steam-accounts/update-steam-account-name-handler';

export const fetchPlayerStart = createAction('player/fetchStart');
export const fetchPlayerSuccess = createAction<PlayerProfile>('player/fetchSuccess');
export const fetchPlayerError = createAction<{ errorCode: ErrorCode }>('player/fetchError');
export const selectedMatchesChanged = createAction<{ selectedChecksums: string[] }>('player/selectedMatchesChanged');
export const playerCommentUpdated = createAction<{ steamId: string; comment: string }>('player/commentUpdated');
export const steamAccountNameUpdated = createAction<UpdateSteamAccountNamePayload>('matches/steamAccountNameUpdated');
