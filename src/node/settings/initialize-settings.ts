import fs from 'fs-extra';
import {
  getDefaultCs2Folders,
  getDefaultCsgoFolders,
} from 'csdm/node/counter-strike/get-default-counter-strike-folders';
import type { Folder } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { writeSettings } from '../settings/write-settings';

export async function initializeSettings() {
  const settings = await getSettings();
  let needToWriteSettings = false;

  async function removeInexistentFoldersFromSettings() {
    const folderPathsToRemove: string[] = [];
    for (const folder of settings.folders) {
      const folderExists = await fs.pathExists(folder.path);
      if (!folderExists) {
        folderPathsToRemove.push(folder.path);
      }
    }

    if (folderPathsToRemove.length > 0) {
      settings.folders = settings.folders.filter((folder) => {
        return !folderPathsToRemove.includes(folder.path);
      });
      needToWriteSettings = true;
    }
  }

  async function removeInexistentDownloadFolderFromSettings() {
    const downloadFolderPath = settings.download.folderPath;
    if (typeof downloadFolderPath !== 'string') {
      return;
    }

    const downloadFolderExists = await fs.pathExists(downloadFolderPath);
    if (!downloadFolderExists) {
      settings.download.folderPath = undefined;
      needToWriteSettings = true;
    }
  }

  function updateSettingsFromCounterStrikeFolders(defaultFolders: string[]) {
    if (defaultFolders.length < 2) {
      return;
    }

    if (settings.folders.length === 0) {
      const folders: Folder[] = defaultFolders.map((folderPath) => {
        return {
          path: folderPath,
          includeSubFolders: false,
        };
      });

      settings.folders = folders;
      settings.demos.currentFolderPath = defaultFolders[1]; // replays folder
      needToWriteSettings = true;
    }

    if (settings.download.folderPath === undefined) {
      settings.download.folderPath = defaultFolders[1]; // replays folder
      needToWriteSettings = true;
    }
  }

  await removeInexistentFoldersFromSettings();
  await removeInexistentDownloadFolderFromSettings();

  if (settings.folders.length === 0 || settings.download.folderPath === undefined) {
    const [cs2DefaultFolders, csgoFolders] = await Promise.all([getDefaultCs2Folders(), getDefaultCsgoFolders()]);
    const defaultFolders = [...cs2DefaultFolders, ...csgoFolders];
    updateSettingsFromCounterStrikeFolders(defaultFolders);
  }

  if (needToWriteSettings) {
    await writeSettings(settings);
  }

  return settings;
}
