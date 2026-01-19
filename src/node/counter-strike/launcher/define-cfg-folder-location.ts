import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function getCfgFolderLocation() {
  return path.join(getAppFolderPath(), 'cfg');
}

export function defineCfgFolderLocation() {
  // This env variable tells CS:GO to save user's config (keybindings, video...) in the specified folder.
  // It allows us to not override user's config when starting CS:GO from the application.
  // ! It does not work for CS2!
  process.env.USRLOCALCSGO = getCfgFolderLocation();
}
