import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v8: Migration = {
  schemaVersion: 8,
  run: (settings: Settings) => {
    if (!settings.matches.demoSources) {
      settings.matches.demoSources = [];
    }

    return Promise.resolve(settings);
  },
};

export default v8;
