import { createAction } from '@reduxjs/toolkit';
import type { Settings } from 'csdm/node/settings/settings';

export const settingsUpdated = createAction<{ settings: Settings }>('settings/updated');
export const downloadFolderChanged = createAction('settings/download/folderChanged');
export const ffmpegVersionChanged = createAction<{ version: string | undefined; isUpdateAvailable: boolean }>(
  'settings/video/ffmpegVersionChanged',
);
export const hlaeVersionChanged = createAction<{ version: string | undefined; isUpdateAvailable: boolean }>(
  'settings/video/hlaeVersionChanged',
);
