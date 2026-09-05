import { isDatabaseConnected } from 'csdm/node/database/database';
import { connectDatabase } from 'csdm/node/database/connect-database';
import type { DatabaseSettings } from 'csdm/node/settings/settings';

let pendingConnection: Promise<void> | null = null;

// A connection in progress may be running the database migrations, which can take a while on a large database.
export function isDatabaseConnectionPending() {
  return pendingConnection !== null;
}

/**
 * Connects to the database, once the connection in progress has settled if there is one.
 * Every connection request goes through here so that attempts never overlap: their pools would step on each other, and
 * isDatabaseConnected() is true as soon as the pools exist, before the migrations ran.
 */
export function startDatabaseConnection(databaseSettings?: DatabaseSettings): Promise<void> {
  const previousConnection = pendingConnection;
  const connection = (async () => {
    if (previousConnection !== null) {
      try {
        await previousConnection;
      } catch {
        // Its requester got the error, this attempt is independent.
      }
    }

    try {
      await connectDatabase(databaseSettings);
    } catch (error) {
      logger.error('Error while connecting to the database');
      logger.error(error);
      throw error;
    }
  })().finally(() => {
    if (pendingConnection === connection) {
      pendingConnection = null;
    }
  });
  pendingConnection = connection;

  return connection;
}

/**
 * Connects to the database using the settings file if there is no active connection yet.
 * It's required for flows that may reach the daemon before the renderer process asked for a connection,
 * e.g. CLI commands or the minimized mode.
 */
export function ensureDatabaseConnection(): Promise<void> {
  // Checked before isDatabaseConnected(): a connection in progress is not usable until its migrations ran.
  if (pendingConnection !== null) {
    return pendingConnection;
  }

  if (isDatabaseConnected()) {
    return Promise.resolve();
  }

  return startDatabaseConnection();
}
