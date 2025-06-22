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
