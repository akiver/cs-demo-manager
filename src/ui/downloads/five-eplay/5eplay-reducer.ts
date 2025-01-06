import { createReducer } from '@reduxjs/toolkit';
import { Status } from 'csdm/common/types/status';
import { DownloadStatus } from 'csdm/common/types/download-status';
import type { ErrorCode } from 'csdm/common/error-code';
import type { FiveEPlayAccount } from 'csdm/common/types/5eplay-account';
import { initializeAppSuccess } from '../../bootstrap/bootstrap-actions';
import { downloadDemoCorrupted, downloadsAdded } from '../downloads-actions';
import { DownloadSource } from '../../../common/download/download-types';
import { downloadDemoSuccess } from '../downloads-actions';
import { downloadDemoExpired } from '../downloads-actions';
import { downloadDemoError } from '../downloads-actions';
import { abortDownload } from '../pending/pending-actions';
import { downloadFolderChanged } from '../../settings/settings-actions';
import { abortDownloads } from '../pending/pending-actions';
import {
  accountAdded,
  accountsUpdated,
  fetchLastMatchesError,
  fetchLastMatchesStart,
  fetchLastMatchesSuccess,
  matchSelected,
} from './5eplay-actions';
import type { FiveEPlayMatch } from 'csdm/common/types/5eplay-match';

type State = {
  readonly status: Status;
  readonly accounts: FiveEPlayAccount[];
  readonly matches: FiveEPlayMatch[];
  readonly errorCode: ErrorCode | undefined;
  readonly selectedMatchId: string | undefined;
};

const initialState: State = {
  status: Status.Idle,
  accounts: [],
  matches: [],
  errorCode: undefined,
  selectedMatchId: undefined,
};

export const fiveEPlayReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchLastMatchesStart, (state) => {
      state.status = Status.Loading;
    })
    .addCase(fetchLastMatchesSuccess, (state, action) => {
      state.status = Status.Success;
      state.matches = action.payload.matches;
      if (action.payload.matches.length > 0) {
        state.selectedMatchId = action.payload.matches[0].id;
      }
    })
    .addCase(fetchLastMatchesError, (state, action) => {
      state.status = Status.Error;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(matchSelected, (state, action) => {
      state.selectedMatchId = action.payload.matchId;
    })
    .addCase(downloadsAdded, (state, action) => {
      for (const download of action.payload.downloads) {
        if (download.source !== DownloadSource['5EPlay']) {
          continue;
        }

        const match = state.matches.find((match) => match.id === download.matchId);
        if (match !== undefined) {
          match.downloadStatus = DownloadStatus.Downloading;
        }
      }
    })
    .addCase(downloadDemoSuccess, (state, action) => {
      const match = state.matches.find((match) => match.id === action.payload.download.matchId);
      if (match !== undefined) {
        match.downloadStatus = DownloadStatus.Downloaded;
      }
    })
    .addCase(downloadDemoExpired, (state, action) => {
      const match = state.matches.find((match) => match.id === action.payload.matchId);
      if (match !== undefined) {
        match.downloadStatus = DownloadStatus.Expired;
      }
    })
    .addCase(downloadDemoCorrupted, (state, action) => {
      const match = state.matches.find((match) => match.id === action.payload.matchId);
      if (match !== undefined) {
        match.downloadStatus = DownloadStatus.Corrupted;
      }
    })
    .addCase(downloadDemoError, (state, action) => {
      const match = state.matches.find((match) => match.id === action.payload.matchId);
      if (match !== undefined) {
        match.downloadStatus = DownloadStatus.Error;
      }
    })
    .addCase(abortDownload, (state, action) => {
      const match = state.matches.find((match) => match.id === action.payload.matchId);
      if (match !== undefined) {
        match.downloadStatus = DownloadStatus.NotDownloaded;
      }
    })
    .addCase(abortDownloads, (state) => {
      for (const match of state.matches) {
        if (match.downloadStatus === DownloadStatus.Downloading) {
          match.downloadStatus = DownloadStatus.NotDownloaded;
        }
      }
    })
    .addCase(initializeAppSuccess, (state, action) => {
      state.accounts = action.payload.fiveEPlayAccounts;
    })
    .addCase(accountAdded, (state, action) => {
      state.accounts.push(action.payload.account);
    })
    .addCase(accountsUpdated, (state, action) => {
      return {
        ...initialState,
        accounts: action.payload.accounts,
      };
    })
    .addCase(downloadFolderChanged, () => {
      return initialState;
    });
});
