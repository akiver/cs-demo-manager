import type { Transaction } from 'kysely';
import type { Database } from '../schema';

export async function ensureMigrationsTableExists(transaction: Transaction<Database>) {
  await transaction.schema
    .createTable('migrations')
    .ifNotExists()
    .addColumn('schema_version', 'integer', (col) => col.notNull().unique())
    .addColumn('run_at', 'timestamptz', (col) => col.notNull())
    .execute();
}
