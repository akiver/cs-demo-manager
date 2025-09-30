import fs from 'fs-extra';
import { defaultSettings } from './default-settings';
import { getSettingsFilePath } from './get-settings-file-path';
import type { Settings } from './settings';
import { writeSettings } from './write-settings';

let recoveringSettings: Settings = defaultSettings;

export async function getSettings(): Promise<Settings> {
  try {
    const settingsFilePath = getSettingsFilePath();
    const settingsFileExists = await fs.pathExists(settingsFilePath);
    if (!settingsFileExists) {
      await writeSettings(defaultSettings);
      return defaultSettings;
    }

    const json = await fs.readFile(settingsFilePath, 'utf8');
    const settings: Settings = JSON.parse(json);

    recoveringSettings = settings;

    return settings;
  } catch (error) {
    logger.error('Failed to parse settings file');
    logger.error(error);

    return recoveringSettings;
  }
}

export async function getBanSettings() {
  const settings = await getSettings();

  return settings.ban ?? defaultSettings.ban;
}

// You should probably use the async version of this function.
// This synchronous version is only intended for use during application bootstrap in order to access settings before the
// Electron app 'ready' event is fired.
export function getSettingsSync() {
  try {
    const settingsFilePath = getSettingsFilePath();
    const settingsFileExists = fs.existsSync(settingsFilePath);
    if (!settingsFileExists) {
      return defaultSettings;
    }

    const json = fs.readFileSync(settingsFilePath, 'utf8');
    return JSON.parse(json);
  } catch (error) {
    logger.error('Failed to parse settings file synchronously');
    logger.error(error);
    return defaultSettings;
  }
}
