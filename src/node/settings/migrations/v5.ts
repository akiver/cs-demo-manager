import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { defaultSettings } from '../default-settings';

const v5: Migration = {
  schemaVersion: 5,
  run: (settings: Settings) => {
    settings.players.tagIds = defaultSettings.players.tagIds;
    settings.playback.highlights.includeDamages = defaultSettings.playback.highlights.includeDamages;
    settings.playback.lowlights.includeDamages = defaultSettings.playback.lowlights.includeDamages;

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v5;
