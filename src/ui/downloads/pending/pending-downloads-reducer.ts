import { createReducer } from '@reduxjs/toolkit';
import type { Download } from 'csdm/common/download/download-types';
import { DownloadStatus } from 'csdm/common/types/download-status';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import {
  downloadDemoCorrupted,
  downloadDemoError,
  downloadDemoExpired,
  downloadDemoProgressChanged,
  downloadDemoSuccess,
  downloadsAdded,
} from '../downloads-actions';
import { abortDownload, abortDownloads } from './pending-actions';

export type PendingDownloadsState = {
  readonly downloads: Download[];
  readonly progress: { [matchId: string]: number };
  readonly status: { [matchId: string]: DownloadStatus };
};

const initialState: PendingDownloadsState = {
  downloads: [],
  progress: {},
  status: {},
};

export const pendingDownloadsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(downloadsAdded, (state, action) => {
      for (const download of action.payload.downloads) {
        state.progress[download.matchId] = 0;
        state.status[download.matchId] = DownloadStatus.NotDownloaded;
        const alreadyExists = state.downloads.some(({ matchId }) => {
          return matchId === download.matchId;
        });
        if (!alreadyExists) {
          state.downloads.push(download);
        }
      }
    })
    .addCase(downloadDemoProgressChanged, (state, action) => {
      const { matchId, progress } = action.payload;
      state.progress[matchId] = progress;
      state.status[matchId] = DownloadStatus.Downloading;
    })
    .addCase(downloadDemoSuccess, (state, action) => {
      state.status[action.payload.download.matchId] = DownloadStatus.Downloaded;
    })
    .addCase(downloadDemoError, (state, action) => {
      state.status[action.payload.matchId] = DownloadStatus.Error;
    })
    .addCase(downloadDemoExpired, (state, action) => {
      state.status[action.payload.matchId] = DownloadStatus.Expired;
    })
    .addCase(downloadDemoCorrupted, (state, action) => {
      state.status[action.payload.matchId] = DownloadStatus.Corrupted;
    })
    .addCase(abortDownload, (state, action) => {
      const { matchId } = action.payload;
      delete state.status[matchId];
      delete state.progress[matchId];
      state.downloads = state.downloads.filter((download) => download.matchId !== matchId);
    })
    .addCase(abortDownloads, () => {
      return initialState;
    })
    .addCase(initializeAppSuccess, (state, action) => {
      for (const download of action.payload.downloads) {
        const alreadyExists = state.downloads.some(({ matchId }) => {
          return matchId === download.matchId;
        });
        if (!alreadyExists) {
          state.downloads.push(download);
        }
      }
    });
});
