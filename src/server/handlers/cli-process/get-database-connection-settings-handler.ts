import type { DatabaseConnectionSettings } from 'csdm/node/settings/settings';
import { getDatabaseConnectionSettings } from 'csdm/node/database/database';
import { ensureDatabaseConnection } from 'csdm/server/ensure-database-connection';
import { throwErrorCodeOrMessage } from './throw-error-code-or-message';

/**
 * Connects the daemon to the database if needed and returns how to reach it.
 * CLI commands that query the database from their own process can't read the settings file for that: with the
 * embedded server the socket folder, TCP port and password are known only to the daemon that started it.
 * The daemon also owns the server's lifetime, it stays up as long as the CLI client remains connected.
 */
export async function getDatabaseConnectionSettingsHandler(): Promise<DatabaseConnectionSettings> {
  try {
    await ensureDatabaseConnection();

    return getDatabaseConnectionSettings();
  } catch (error) {
    throwErrorCodeOrMessage(error, 'Error while retrieving the database connection settings');
  }
}
