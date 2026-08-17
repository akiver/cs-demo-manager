import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { Settings } from 'csdm/node/settings/settings';
import { commitDatabaseConnection, discardPreparedDatabaseConnection } from 'csdm/node/database/database';
import { openDatabase, prepareDatabaseConnection } from 'csdm/node/database/open-database';
import { updateSettings } from 'csdm/node/settings/update-settings';
import { startBackgroundTasks } from 'csdm/server/start-background-tasks';

let pendingConnectionTransition = Promise.resolve();

function serializeConnectionTransition<T>(transition: () => Promise<T>): Promise<T> {
  const result = pendingConnectionTransition.then(transition, transition);
  pendingConnectionTransition = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}

export function connectDatabase(databaseSettings?: DatabaseSettings) {
  return serializeConnectionTransition(async () => {
    // The app owns the cluster lifecycle: connecting it to an external server may release the
    // bundled one, while the CLI calls openDatabase() directly and never stops it.
    await openDatabase(databaseSettings, { releaseEmbeddedCluster: true });
    void startBackgroundTasks();
  });
}

/** Prepares and migrates the candidate, persists it, then atomically publishes the connection. */
export function connectDatabaseAndPersist(databaseSettings: DatabaseSettings): Promise<Settings> {
  return serializeConnectionTransition(async () => {
    const connection = await prepareDatabaseConnection(databaseSettings);

    let settings: Settings;
    try {
      settings = await updateSettings({ database: databaseSettings });
    } catch (error) {
      try {
        await discardPreparedDatabaseConnection(connection, { stopEmbeddedIfUnused: true });
      } catch (cleanupError) {
        logger.error('Failed to discard a database candidate after settings persistence failed');
        logger.error(cleanupError);
      }
      throw error;
    }

    await commitDatabaseConnection(connection, { stopPreviousEmbeddedIfUnused: true });
    void startBackgroundTasks();

    return settings;
  });
}
