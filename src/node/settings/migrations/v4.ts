import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { defaultSettings } from '../default-settings';

const v4: Migration = {
  schemaVersion: 4,
  run: (settings: Settings) => {
    settings.teams = defaultSettings.teams;
    settings.teamProfile = defaultSettings.teamProfile;
    settings.playback.playerVoicesEnabled = defaultSettings.playback.playerVoicesEnabled;

    return Promise.resolve(settings);
  },
};

export default v4;
