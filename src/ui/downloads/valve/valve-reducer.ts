import { createReducer } from '@reduxjs/toolkit';
import { Status } from 'csdm/common/types/status';
import type { ValveMatch } from 'csdm/common/types/valve-match';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { DownloadSource } from 'csdm/common/download/download-types';
import { abortDownloads } from '../pending/pending-actions';
import {
  currentSteamIdDetected,
  fetchLastMatchesError,
  fetchLastMatchesStart,
  fetchLastMatchesSuccess,
  matchSelected,
  steamIdSelected,
} from './valve-actions';
import {
  downloadDemoCorrupted,
  downloadDemoError,
  downloadDemoExpired,
  downloadDemoSuccess,
  downloadsAdded,
} from '../downloads-actions';
import { abortDownload } from '../pending/pending-actions';
import { downloadFolderChanged } from 'csdm/ui/settings/settings-actions';
import type { ErrorCode } from 'csdm/common/error-code';

type ValveState = {
  readonly status: Status;
  readonly matches: ValveMatch[];
  readonly selectedMatchId?: string;
  readonly selectedSteamId?: string;
  readonly currentSteamId?: string; // SteamID of the current Steam account logged in (retrieved with boiler-writter)
  readonly errorCode: ErrorCode | undefined;
};

const initialState: ValveState = {
  status: Status.Idle,
  matches: [],
  errorCode: undefined,
};

export const valveReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchLastMatchesStart, (state) => {
      state.status = Status.Loading;
      state.matches = [];
      state.errorCode = undefined;
    })
    .addCase(fetchLastMatchesSuccess, (state, action) => {
      const { matches } = action.payload;
      state.status = Status.Success;
      state.matches = matches;
      if (matches.length > 0) {
        const match = matches[0];
        state.selectedMatchId = match.id;
        state.selectedSteamId = state.currentSteamId;
      }
    })
    .addCase(fetchLastMatchesError, (state, action) => {
      state.status = Status.Error;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(currentSteamIdDetected, (state, action) => {
      state.currentSteamId = action.payload.steamId;
      state.selectedSteamId = state.currentSteamId;
    })
    .addCase(steamIdSelected, (state, action) => {
      state.selectedSteamId = action.payload.steamId;
    })
    .addCase(matchSelected, (state, action) => {
      state.selectedMatchId = action.payload.matchId;
      state.selectedSteamId = state.currentSteamId;
    })
    .addCase(downloadsAdded, (state, action) => {
      for (const download of action.payload.downloads) {
        if (download.source !== DownloadSource.Valve) {
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
    .addCase(downloadFolderChanged, () => {
      return initialState;
    });
});
