import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v14: Migration = {
  schemaVersion: 14,
  run: (settings: Settings) => {
    // Existing installations already have a PostgreSQL server configured, keep using it.
    // The embedded mode is only the default for new installations, see default-settings.ts.
    settings.database = {
      ...settings.database,
      mode: 'external',
    };

    return Promise.resolve(settings);
  },
};

export default v14;
