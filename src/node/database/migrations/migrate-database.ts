import { DatabaseError } from 'pg';
import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { ensureMigrationsTableExists } from 'csdm/node/database/migrations/ensure-migrations-table-exists';
import { resetDatabase } from '../reset-database';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import type { Migration } from './migration';
import { getAllMigrations } from './get-all-migrations';
import { DatabaseSchemaVersionMismatch } from '../database-schema-version-mismatch-error';

// This variable represents the current version of the database schema.
// It's used to migrate database schema at app startup.
// If you need to change the database schema or change data currently in the DB, this variable has to be incremented
// and the corresponding migration must be added to the getAllMigrations function!
const CURRENT_SCHEMA_VERSION = 8;

function getMigrationsForUpgrade(migrations: Migration[], currentSchemaVersion: number) {
  return migrations.filter((migration) => {
    return migration.schemaVersion > currentSchemaVersion && migration.schemaVersion <= CURRENT_SCHEMA_VERSION;
  });
}

async function getCurrentSchemaVersion() {
  try {
    const migrationRow = await db
      .selectFrom('migrations')
      .select('schema_version as schemaVersion')
      .orderBy('schema_version', 'desc')
      .executeTakeFirst();

    return migrationRow?.schemaVersion ?? 0;
  } catch (error) {
    if (error instanceof DatabaseError && error.code === PostgresqlErrorCode.UndefinedTable) {
      return 0;
    }

    throw error;
  }
}

export async function migrateDatabase() {
  try {
    let currentSchemaVersion = await getCurrentSchemaVersion();
    const isDowngrade = currentSchemaVersion > CURRENT_SCHEMA_VERSION;
    if (isDowngrade) {
      throw new DatabaseSchemaVersionMismatch(currentSchemaVersion, CURRENT_SCHEMA_VERSION);
    }

    await db.transaction().execute(async (transaction) => {
      let shouldResetDatabase = false;
      if (currentSchemaVersion === 0) {
        const tables = await transaction.introspection.getTables();
        // At this point, if there is at least 1 table it means that the migrations table has been manually truncated or
        // dropped which is something that end users should not do but it can be useful during development.
        // In this case we treat it as a fresh installation.
        shouldResetDatabase = tables.length > 0;
      }

      shouldResetDatabase = shouldResetDatabase || isDowngrade;
      if (shouldResetDatabase) {
        currentSchemaVersion = 0;
        await resetDatabase(transaction);
      }

      await ensureMigrationsTableExists(transaction);

      const isUpgrade = currentSchemaVersion < CURRENT_SCHEMA_VERSION;
      if (!isUpgrade) {
        return;
      }

      const allMigrations = await getAllMigrations();
      const migrations = getMigrationsForUpgrade(allMigrations, currentSchemaVersion);
      for (const migration of migrations) {
        await migration.run(transaction);
      }

      await transaction
        .insertInto('migrations')
        .values({
          schema_version: CURRENT_SCHEMA_VERSION,
          run_at: sql`now()`,
        })
        .execute();
    });
  } catch (error) {
    logger.log('Error while migrating database');
    logger.log(error);
    throw error;
  }
}
