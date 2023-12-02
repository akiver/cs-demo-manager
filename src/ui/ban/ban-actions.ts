import { createAction } from '@reduxjs/toolkit';
import type { IgnoredSteamAccount } from 'csdm/common/types/ignored-steam-account';

export const addIgnoredSteamAccountSuccess = createAction<{ account: IgnoredSteamAccount }>(
  'ban/ignoredAccount/addSuccess',
);
export const deleteIgnoredSteamAccountSuccess = createAction<{ account: IgnoredSteamAccount }>(
  'ban/ignoredAccount/deleteSuccess',
);
