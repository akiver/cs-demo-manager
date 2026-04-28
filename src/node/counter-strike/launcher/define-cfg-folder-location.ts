import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function getCfgFolderLocation() {
  return path.join(getAppFolderPath(), 'cfg');
}

export function defineCfgFolderLocation(cfgFolderPath?: string) {
  // This env variable tells CS to save user's config (keybindings, video...) in the specified folder.
  // It allows us to not override user's config when starting CS from the application.
  process.env.USRLOCALCSGO = cfgFolderPath ?? getCfgFolderLocation();
}
