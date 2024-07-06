import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { executePsql } from './psql/execute-psql';

export async function createDatabase(databaseSettings: DatabaseSettings) {
  const { database, hostname, username, port, password } = databaseSettings;
  const command = `-c "CREATE DATABASE ${database} WITH ENCODING 'UTF8'" "postgresql://${username}:${password}@${hostname}:${port}"`;
  await executePsql(command, { timeoutMs: 6000 });
}
