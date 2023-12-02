import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

export function getSettingsFilePath() {
  const settingsFilePath = path.resolve(getAppFolderPath(), 'settings.json');
  return settingsFilePath;
}
