import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v10: Migration = {
  schemaVersion: 10,
  run: (settings: Settings) => {
    settings.video.recordAudio = true;
    settings.download.downloadRenownDemosAtStartup = true;
    settings.download.downloadRenownDemosInBackground = true;

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v10;
