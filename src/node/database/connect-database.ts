import { createDatabaseConnection, destroyDatabaseConnection } from 'csdm/node/database/database';
import type { DatabaseConnectionSettings, DatabaseSettings } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { createDatabaseIfNotExists } from 'csdm/node/database/create-database-if-not-exists';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';
import { DatabaseMode } from 'csdm/common/types/database-mode';
import { startEmbeddedPostgreSql } from './embedded/embedded-postgresql';

export async function connectDatabase(databaseSettings?: DatabaseSettings) {
  if (databaseSettings === undefined) {
    const settings = await getSettings();
    databaseSettings = settings.database;
  }

  let connectionSettings: DatabaseConnectionSettings;
  if (databaseSettings.mode === DatabaseMode.Embedded) {
    connectionSettings = await startEmbeddedPostgreSql();
  } else {
    // Settings files written before the embedded server existed have no mode, they target an external server.
    connectionSettings = databaseSettings;
  }

  await createDatabaseIfNotExists(connectionSettings);
  createDatabaseConnection(connectionSettings);
  try {
    await migrateDatabase();
  } catch (error) {
    // The daemon must not report itself as connected to a database whose schema is not up to date, other clients
    // (e.g. the CLI) would skip the connection and run queries on it.
    try {
      await destroyDatabaseConnection();
    } catch (destroyError) {
      logger.error('Error while destroying the database connection after a failed migration');
      logger.error(destroyError);
    }
    throw error;
  }
  void startBackgroundTasks();
}
