import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v16: Migration = {
  schemaVersion: 16,
  run: (settings: Settings) => {
    settings.analyze.computeTimeToDamage = true;

    return Promise.resolve(settings);
  },
};

export default v16;
