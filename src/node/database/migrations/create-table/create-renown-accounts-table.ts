import type { Transaction } from 'kysely';
import type { Database } from '../../schema';

export async function createRenownAccountsTable(transaction: Transaction<Database>) {
  await transaction.schema
    .createTable('renown_accounts')
    .ifNotExists()
    .addColumn('steam_id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('nickname', 'varchar', (col) => col.notNull())
    .addColumn('avatar_url', 'varchar', (col) => col.notNull())
    .addColumn('is_current', 'boolean', (col) => col.notNull())
    .execute();
}
