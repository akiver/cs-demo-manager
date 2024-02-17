import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { executePsql } from './psql/execute-psql';

export async function createDatabase(databaseSettings: DatabaseSettings) {
  const { database, hostname, username, port, password } = databaseSettings;
  const command = `-c "CREATE DATABASE ${database}" "postgresql://${username}:${password}@${hostname}:${port}" ENCODING 'UTF8'`;
  await executePsql(command, { timeout: 5000 });
}
