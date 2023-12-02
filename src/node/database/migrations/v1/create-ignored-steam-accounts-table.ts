import type { Migration } from '../migration';
import { sql } from 'kysely';

const createIgnoredSteamAccountsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('ignored_steam_accounts')
      .ifNotExists()
      .addColumn('steam_id', 'varchar', (col) =>
        col
          .notNull()
          .primaryKey()
          .check(sql`length((steam_id)::text) > 0`),
      )
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createIgnoredSteamAccountsTable;
