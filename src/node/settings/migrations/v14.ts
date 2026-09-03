import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { DatabaseMode } from 'csdm/common/types/database-mode';

// Existing installations were using a PostgreSQL server, only fresh installations default to the embedded database.
const v14: Migration = {
  schemaVersion: 14,
  run: (settings: Settings) => {
    settings.database = {
      ...settings.database,
      mode: DatabaseMode.PostgreSql,
    };

    return Promise.resolve(settings);
  },
};

export default v14;
