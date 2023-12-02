import { createAction } from '@reduxjs/toolkit';

export const folderAdded = createAction<string>('settings/folders/added');
export const folderRemoved = createAction<string>('settings/folders/removed');
export const folderUpdated = createAction<string>('settings/folders/updated');
