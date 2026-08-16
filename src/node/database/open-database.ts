import { createDatabaseConnection } from 'csdm/node/database/database';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { createDatabaseIfNotExists } from 'csdm/node/database/create-database-if-not-exists';
import { startEmbeddedCluster } from 'csdm/node/database/embedded/start-cluster';
import { stopEmbeddedCluster } from 'csdm/node/database/embedded/stop-cluster';

type Options = {
  /**
   * Whether the bundled cluster has to be stopped once an external server is connected.
   * ! Only the app may ask for it: the CLI must never stop the cluster, the app may be running and
   * in the middle of a demo analysis.
   */
  releaseEmbeddedCluster: boolean;
};

/**
 * Resolves the settings to connect with, starting the bundled PostgreSQL cluster when the embedded
 * mode is enabled, then connects and migrates the schema.
 * ! Used by both the WebSocket server and the CLI, it must not depend on the server code.
 */
export async function openDatabase(
  databaseSettings?: DatabaseSettings,
  options: Options = { releaseEmbeddedCluster: false },
): Promise<DatabaseSettings> {
  if (databaseSettings === undefined) {
    const settings = await getSettings();
    databaseSettings = settings.database;
  }

  const isEmbedded = databaseSettings.mode === 'embedded';
  const connectionSettings = isEmbedded ? await startEmbeddedCluster() : databaseSettings;

  await createDatabaseIfNotExists(connectionSettings);
  createDatabaseConnection(connectionSettings);
  await migrateDatabase();

  if (!isEmbedded && options.releaseEmbeddedCluster) {
    // ! Only once the external server has proven to work: the bundled cluster is what the user comes
    // back to when the connection fails, releasing it before would take that fallback down too.
    await stopEmbeddedCluster();
  }

  return connectionSettings;
}
