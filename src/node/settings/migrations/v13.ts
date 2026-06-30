import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v13: Migration = {
  schemaVersion: 13,
  run: (settings: Settings) => {
    settings.autoExtractDemosFromArchives = [];

    return Promise.resolve(settings);
  },
};

export default v13;
