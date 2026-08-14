import { createDatabaseConnection } from 'csdm/node/database/database';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { createDatabaseIfNotExists } from 'csdm/node/database/create-database-if-not-exists';
import { DatabaseMode } from 'csdm/common/types/database-mode';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';

export async function connectDatabase(databaseSettings?: DatabaseSettings) {
  if (databaseSettings === undefined) {
    const settings = await getSettings();
    databaseSettings = settings.database;
  }

  // The embedded database is bundled with the app, only the "postgresql" mode requires a PostgreSQL server on
  // the host machine.
  if (databaseSettings.mode === DatabaseMode.PostgreSql) {
    await createDatabaseIfNotExists(databaseSettings);
  }

  await createDatabaseConnection(databaseSettings);
  await migrateDatabase();
  void startBackgroundTasks();
}
