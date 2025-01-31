import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v6: Migration = {
  schemaVersion: 6,
  run: (settings: Settings) => {
    settings.download.download5EPlayDemosAtStartup = true;
    settings.download.download5EPlayDemosInBackground = true;
    settings.video.showXRay = true;
    settings.video.playerVoicesEnabled = true;
    settings.ui.redirectDemoToMatch = false;

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v6;
