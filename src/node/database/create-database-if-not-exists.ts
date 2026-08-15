import { Client } from 'pg';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { PostgresqlErrorCode } from './postgresql-error-code';

export function escapeIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

export async function createDatabaseIfNotExists(settings: DatabaseSettings) {
  // Connecting to the "postgres" maintenance database because the app's one may not exist yet.
  const client = new Client({
    host: settings.hostname,
    port: settings.port,
    user: settings.username,
    password: settings.password,
    database: 'postgres',
    connectionTimeoutMillis: 10000,
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
