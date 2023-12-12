import { createAction } from '@reduxjs/toolkit';
import type { Demo } from 'csdm/common/types/demo';
import type { Download, DownloadDemoSuccess } from 'csdm/common/download/download-types';

export const downloadDemoError = createAction<{ matchId: string }>('downloads/downloadDemoError');
export const downloadDemoExpired = createAction<{ matchId: string }>('downloads/downloadDemoExpired');
export const downloadDemoSuccess = createAction<DownloadDemoSuccess>('downloads/downloadDemoSuccess');
export const downloadDemoCorrupted = createAction<{ matchId: string }>('downloads/downloadDemoCorrupted');
export const downloadsAdded = createAction<{ downloads: Download[] }>('downloads/downloadsAdded');
export const downloadDemoProgressChanged = createAction<{ matchId: string; progress: number }>(
  'downloads/downloadProgress',
);
export const demoDownloadedInCurrentFolderLoaded = createAction<Demo>('downloads/demoDownloadedInCurrentFolderLoaded');
