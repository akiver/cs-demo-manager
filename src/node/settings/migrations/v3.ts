import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { defaultSettings } from '../default-settings';

const v3: Migration = {
  schemaVersion: 3,
  run: (settings: Settings) => {
    settings.playback.useHlae = defaultSettings.playback.useHlae;

    return Promise.resolve(settings);
  },
};

export default v3;
