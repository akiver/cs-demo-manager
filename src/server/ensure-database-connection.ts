import { isDatabaseConnected } from 'csdm/node/database/database';
import { connectDatabase } from 'csdm/node/database/connect-database';

let connectionPromise: Promise<void> | null = null;

/**
 * Connects to the database using the settings file if there is no active connection yet.
 * It's required for flows that may reach the daemon before the renderer process asked for a connection,
 * e.g. CLI commands or the minimized mode.
 */
export async function ensureDatabaseConnection() {
  if (isDatabaseConnected()) {
    return;
  }

  if (connectionPromise === null) {
    connectionPromise = connectDatabase().finally(() => {
      connectionPromise = null;
    });
  }

  return connectionPromise;
}
