import path from 'node:path';
import fs from 'fs-extra';
import { defaultSettings } from './default-settings';
import type { Settings } from './settings';
import { writeSettings } from './write-settings';
import { getSettingsFilePath } from './get-settings-file-path';
import { getAllMigrations } from './get-all-migrations';
import { CURRENT_SCHEMA_VERSION } from './schema-version';
import type { Migration } from './migration';
import { appFolderExistedAtProcessStart } from './installation-state';
import { getClusterDataFolderPath, getClusterStateFilePath } from 'csdm/node/database/embedded/embedded-postgres-paths';

async function hasValidEmbeddedCluster() {
  try {
    const state: unknown = JSON.parse(await fs.readFile(getClusterStateFilePath(), 'utf8'));
    if (
      typeof state !== 'object' ||
      state === null ||
      !('password' in state) ||
      typeof state.password !== 'string' ||
      state.password === ''
    ) {
      return false;
    }

    await fs.access(path.join(getClusterDataFolderPath(), 'PG_VERSION'));

    return true;
  } catch {
    return false;
  }
}

async function buildSettingsForMissingOrCorruptedFile() {
  const embeddedClusterExists = await hasValidEmbeddedCluster();
  if (embeddedClusterExists || !appFolderExistedAtProcessStart) {
    return structuredClone(defaultSettings);
  }

  return {
    ...structuredClone(defaultSettings),
    database: {
      ...defaultSettings.database,
      mode: 'external' as const,
    },
  };
}

async function backupCorruptedSettingsFile(settingsFilePath: string) {
  const backupFilePath = `${settingsFilePath}.corrupted-${Date.now()}`;
  await fs.copy(settingsFilePath, backupFilePath);
  logger.error(`The corrupted settings file was preserved at ${backupFilePath}`);
}

function parseSettingsForMigration(content: string): Settings {
  const parsed: unknown = JSON.parse(content);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('The settings file does not contain an object');
  }

  const settings = parsed as Partial<Settings>;
  if (!Number.isInteger(settings.schemaVersion) || settings.database === undefined) {
    throw new Error('The settings file is missing its schema version or database settings');
  }
  if (
    (settings.schemaVersion ?? 0) >= 14 &&
    settings.database.mode !== 'embedded' &&
    settings.database.mode !== 'external'
  ) {
    throw new Error('The settings file contains an invalid database mode');
  }

  return settings as Settings;
}

function getMigrationsForUpgrade(migrations: Migration[], currentSchemaVersion: number) {
  return migrations.filter((migration) => {
    return migration.schemaVersion > currentSchemaVersion && migration.schemaVersion <= CURRENT_SCHEMA_VERSION;
  });
}

export async function migrateSettings(): Promise<Settings> {
  const settingsFilePath = getSettingsFilePath();
  const settingsFileExists = await fs.pathExists(settingsFilePath);
  if (!settingsFileExists) {
    // ! Fresh installation: the default settings already are at the current schema version.
    // Running the migrations on them would apply upgrade paths meant for existing installations,
    // for example the one that keeps them on an external PostgreSQL server.
    const settings = await buildSettingsForMissingOrCorruptedFile();
    await writeSettings(settings);

    return settings;
  }

  let settings: Settings;
  try {
    settings = parseSettingsForMigration(await fs.readFile(settingsFilePath, 'utf8'));
  } catch (error) {
    logger.error('Failed to parse settings while migrating them');
    logger.error(error);
    await backupCorruptedSettingsFile(settingsFilePath);
    settings = await buildSettingsForMissingOrCorruptedFile();
    await writeSettings(settings);

    return settings;
  }
  const schemaVersion = settings.schemaVersion;

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
