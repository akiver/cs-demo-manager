import type { Migration } from './migration';

// All new settings migrations must be added here otherwise it will never run.
// Don't forget to increment the variable CURRENT_SCHEMA_VERSION!
// Migrations are lazy loaded because we don't need to keep them in memory.
export async function getAllMigrations(): Promise<Migration[]> {
  const modules = await Promise.all([
    import('./migrations/initialize-locale'),
    import('./migrations/v2'),
    import('./migrations/v3'),
    import('./migrations/v4'),
    import('./migrations/v5'),
    import('./migrations/v6'),
    import('./migrations/v7'),
    import('./migrations/v8'),
  ]);
  const migrations: Migration[] = modules.map((module) => module.default);

  return migrations.sort((migrationA, migrationB) => {
    return migrationA.schemaVersion - migrationB.schemaVersion;
  });
}
