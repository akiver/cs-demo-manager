import { ensureDatabaseConnection } from 'csdm/server/ensure-database-connection';
import { throwErrorCodeOrMessage } from './throw-error-code-or-message';

/**
 * Connects the daemon to the database if needed.
 * Starting the embedded server on first use may take a while (initdb, migrations...): CLI commands ask for it before
 * their actual requests so that those keep a short timeout.
 */
export async function ensureDatabaseConnectionHandler() {
  try {
    await ensureDatabaseConnection();
  } catch (error) {
    throwErrorCodeOrMessage(error, 'Error while connecting to the database');
  }
}
