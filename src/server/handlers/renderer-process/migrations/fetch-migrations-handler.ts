import { fetchMigrations } from 'csdm/node/database/migrations/fetch-migrations';

export async function fetchMigrationsHandler() {
  const migrations = await fetchMigrations(5);

  return migrations;
}
