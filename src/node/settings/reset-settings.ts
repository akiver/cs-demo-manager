import { defaultSettings } from './default-settings';
import { getSettings } from './get-settings';
import type { Settings } from './settings';
import { writeSettings } from './write-settings';

export async function resetSettings() {
  const currentSettings = await getSettings();

  const newSettings: Settings = {
    ...defaultSettings,
    database: currentSettings.database,
  };

  await writeSettings(newSettings);
}
