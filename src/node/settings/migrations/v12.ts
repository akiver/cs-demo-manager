import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v12: Migration = {
  schemaVersion: 12,
  run: (settings: Settings) => {
    settings.playback.round.waitForRoundEnd = false;

    return Promise.resolve(settings);
  },
};

export default v12;
