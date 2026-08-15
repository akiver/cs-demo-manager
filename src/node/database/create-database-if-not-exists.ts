import { Client, escapeIdentifier } from 'pg';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { PostgresqlErrorCode } from './postgresql-error-code';

const TIMEOUT_IN_MS = 10000;

async function createDatabase(settings: DatabaseSettings) {
  // Connecting to the "postgres" maintenance database because the app's one may not exist yet.
  const client = new Client({
    host: settings.hostname,
    port: settings.port,
    user: settings.username,
    password: settings.password,
    database: 'postgres',
    // The three of them are needed to bound the startup: connectionTimeoutMillis only covers the
    // handshake, statement_timeout is server-side so it can't fire on a server that stopped
    // answering, and query_timeout is the client-side timer that covers that case.
    connectionTimeoutMillis: TIMEOUT_IN_MS,
    statement_timeout: TIMEOUT_IN_MS,
    query_timeout: TIMEOUT_IN_MS,
  });

  await client.connect();

  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [settings.database]);
    if (rowCount !== null && rowCount > 0) {
      return;
    }

    // The database name is an identifier, it can't be sent as a query parameter.
    await client.query(`CREATE DATABASE ${escapeIdentifier(settings.database)} WITH ENCODING 'UTF8'`);
  } catch (error) {
    // Another process created the database between the SELECT and the CREATE.
    const isDuplicateDatabase =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === PostgresqlErrorCode.DuplicateDatabase;
    if (!isDuplicateDatabase) {
      throw error;
    }
  } finally {
    await client.end();
  }
}

/**
 * Creates the app's database when it doesn't exist yet.
 *
 * ! Failures are logged, not thrown: the "postgres" maintenance database may not exist or may not be
 * reachable by the user's role, which is common on managed servers where the database has been
 * provisioned by someone else. Whether the app can run is decided by the connection to its own
 * database that follows, not by this function.
 */
export async function createDatabaseIfNotExists(settings: DatabaseSettings) {
  try {
    await createDatabase(settings);
  } catch (error) {
    logger.warn(`Unable to create the database "${settings.database}", assuming it already exists`);
    logger.warn(error);
  }
}
