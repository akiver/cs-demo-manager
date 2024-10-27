import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function defineCfgFolderLocation() {
  // This env variable tells CS to save user's config (keybindings, video...) in the specified folder.
  // It allows us to not override user's config when starting CS from the application.
  process.env.USRLOCALCSGO = path.join(getAppFolderPath(), 'cfg');
}
