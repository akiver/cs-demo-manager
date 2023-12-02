import { createAction } from '@reduxjs/toolkit';

export const abortDownload = createAction<{ matchId: string }>('downloads/pending/abortDemoDownload');
export const abortDownloads = createAction('downloads/pending/abortDownloads');
