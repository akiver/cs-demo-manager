import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { DatabaseMode } from 'csdm/common/types/database-mode';

const v14: Migration = {
  schemaVersion: 14,
  run: (settings: Settings) => {
    // The database mode was added in v14. Settings written before have no mode and target an external database,
    // the only mode available at the time. Fresh installations default to the embedded database mode.
    const mode: DatabaseMode | undefined = settings.database.mode;
    settings.database = {
      ...settings.database,
      mode: mode ?? DatabaseMode.External,
    };

    // Preserve the current macOS behavior of existing installations: the app opened at login was never minimized.
    // Fresh installations enable it during the first launch.
    settings.startMinimizedAtLogin = false;

    return Promise.resolve(settings);
  },
};

export default v14;
