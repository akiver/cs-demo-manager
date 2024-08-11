import type { Migration } from './migration';

const v5: Migration = {
  schemaVersion: 5,
  run: async (transaction) => {
    await transaction.schema
      .createTable('steam_account_overrides')
      .ifNotExists()
      .addColumn('steam_id', 'varchar', (col) => col.primaryKey().notNull())
      .addColumn('name', 'text', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v5;
