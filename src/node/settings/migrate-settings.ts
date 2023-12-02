import fs from 'fs-extra';
import { defaultSettings } from './default-settings';
import type { Settings } from './settings';
import { writeSettings } from './write-settings';
import { getSettingsFilePath } from './get-settings-file-path';
import { getSettings } from './get-settings';
import { getAllMigrations } from './get-all-migrations';
import { CURRENT_SCHEMA_VERSION } from './schema-version';
import type { Migration } from './migration';

function getMigrationsForUpgrade(migrations: Migration[], currentSchemaVersion: number) {
  return migrations.filter((migration) => {
    return migration.schemaVersion > currentSchemaVersion && migration.schemaVersion <= CURRENT_SCHEMA_VERSION;
  });
}

export async function migrateSettings(): Promise<Settings> {
  let schemaVersion = 0;
  let settings = defaultSettings;
  const settingsFilePath = getSettingsFilePath();
  const settingsFileExists = await fs.pathExists(settingsFilePath);
  if (settingsFileExists) {
    settings = await getSettings();
    schemaVersion = settings.schemaVersion;
  }

  const isDowngrade = schemaVersion > CURRENT_SCHEMA_VERSION;
  if (isDowngrade) {
    await writeSettings(defaultSettings);
    return defaultSettings;
  }

  const isUpgrade = schemaVersion < CURRENT_SCHEMA_VERSION;
  if (!isUpgrade) {
    return settings;
  }

  const allMigrations = await getAllMigrations();
  const migrations = getMigrationsForUpgrade(allMigrations, schemaVersion);
  for (const migration of migrations) {
    await migration.run(settings);
  }

  settings.schemaVersion = CURRENT_SCHEMA_VERSION;
  await writeSettings(settings);

  return settings;
}
