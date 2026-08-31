import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v14: Migration = {
  schemaVersion: 14,
  run: (settings: Settings) => {
    // ! A fresh installation already carries a mode and must keep it, the embedded database is its
    // default. Only settings written before this schema version have none, and those belong to an
    // installation that already has a PostgreSQL server configured.
    if (settings.database.mode === undefined) {
      settings.database = {
        ...settings.database,
        mode: 'external',
      };
    }

    return Promise.resolve(settings);
  },
};

export default v14;
