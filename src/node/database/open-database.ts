import { createDatabaseConnection } from 'csdm/node/database/database';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { createDatabaseIfNotExists } from 'csdm/node/database/create-database-if-not-exists';
import { startEmbeddedCluster } from 'csdm/node/database/embedded/start-cluster';
import { stopEmbeddedCluster } from 'csdm/node/database/embedded/stop-cluster';

/**
 * Resolves the settings to connect with, starting the bundled PostgreSQL cluster when the embedded
 * mode is enabled, then connects and migrates the schema.
 * ! Used by both the WebSocket server and the CLI, it must not depend on the server code.
 */
export async function openDatabase(databaseSettings?: DatabaseSettings): Promise<DatabaseSettings> {
  if (databaseSettings === undefined) {
    const settings = await getSettings();
    databaseSettings = settings.database;
  }

  let connectionSettings: DatabaseSettings;
  if (databaseSettings.mode === 'embedded') {
    connectionSettings = await startEmbeddedCluster();
  } else {
    connectionSettings = databaseSettings;
    // Switching to an external server releases the bundled cluster.
    await stopEmbeddedCluster();
  }

  await createDatabaseIfNotExists(connectionSettings);
  createDatabaseConnection(connectionSettings);
  await migrateDatabase();

  return connectionSettings;
}
