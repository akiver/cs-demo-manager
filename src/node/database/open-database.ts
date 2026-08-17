import {
  commitDatabaseConnection,
  createDatabaseConnection,
  discardPreparedDatabaseConnection,
  type PreparedDatabaseConnection,
} from 'csdm/node/database/database';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { getSettings } from 'csdm/node/settings/get-settings';
import { migrateDatabase } from 'csdm/node/database/migrations/migrate-database';
import { createDatabaseIfNotExists } from 'csdm/node/database/create-database-if-not-exists';
import { startEmbeddedCluster } from 'csdm/node/database/embedded/start-cluster';
import { releaseEmbeddedClusterSession } from 'csdm/node/database/embedded/stop-cluster';

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
  const connection = await prepareDatabaseConnection(databaseSettings);

  await commitDatabaseConnection(connection, {
    stopPreviousEmbeddedIfUnused: options.releaseEmbeddedCluster,
  });

  return connection.settings;
}

export async function prepareDatabaseConnection(
  databaseSettings?: DatabaseSettings,
): Promise<PreparedDatabaseConnection> {
  if (databaseSettings === undefined) {
    const settings = await getSettings();
    databaseSettings = settings.database;
  }

  const isEmbedded = databaseSettings.mode === 'embedded';
  const embeddedSession = isEmbedded ? await startEmbeddedCluster() : undefined;
  const connectionSettings = embeddedSession?.settings ?? databaseSettings;

  let connection: PreparedDatabaseConnection | undefined;
  try {
    await createDatabaseIfNotExists(connectionSettings);
    connection = createDatabaseConnection(connectionSettings, embeddedSession);
    await migrateDatabase(connection.database);

    return connection;
  } catch (error) {
    try {
      if (connection !== undefined) {
        await discardPreparedDatabaseConnection(connection, { stopEmbeddedIfUnused: true });
      } else if (embeddedSession !== undefined) {
        await releaseEmbeddedClusterSession(embeddedSession, { stopIfUnused: true });
      }
    } catch (cleanupError) {
      logger.error('Failed to discard a database candidate after preparation failed');
      logger.error(cleanupError);
    }

    throw error;
  }
}
