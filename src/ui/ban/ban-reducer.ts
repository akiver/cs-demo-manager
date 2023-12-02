import { createReducer } from '@reduxjs/toolkit';
import type { IgnoredSteamAccount } from 'csdm/common/types/ignored-steam-account';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import { addIgnoredSteamAccountSuccess, deleteIgnoredSteamAccountSuccess } from './ban-actions';

export type BanState = {
  readonly ignoredAccounts: IgnoredSteamAccount[];
};

const initialState: BanState = {
  ignoredAccounts: [],
};

export const banReducer = createReducer(initialState, (builder) => {
  builder.addCase(initializeAppSuccess, (state, action) => {
    state.ignoredAccounts = action.payload.ignoredSteamAccounts;
  });
  builder.addCase(addIgnoredSteamAccountSuccess, (state, action) => {
    if (!state.ignoredAccounts.some((account) => account.steamId === action.payload.account.steamId)) {
      state.ignoredAccounts.push(action.payload.account);
    }
  });
  builder.addCase(deleteIgnoredSteamAccountSuccess, (state, action) => {
    state.ignoredAccounts = state.ignoredAccounts.filter((account) => {
      return account.steamId !== action.payload.account.steamId;
    });
  });
});
