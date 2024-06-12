import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { defaultSettings } from '../default-settings';

const v5: Migration = {
  schemaVersion: 5,
  run: (settings: Settings) => {
    settings.players.tagIds = defaultSettings.players.tagIds;

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v5;
