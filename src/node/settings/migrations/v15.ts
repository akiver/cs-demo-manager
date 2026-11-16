import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v15: Migration = {
  schemaVersion: 15,
  run: (settings: Settings) => {
    settings.download.analyzeDownloadedDemos = false;

    return Promise.resolve(settings);
  },
};

export default v15;
