import type { Migration } from './migration';

const v7: Migration = {
  schemaVersion: 7,
  run: async (transaction) => {
    await transaction.schema
      .createTable('5eplay_accounts')
      .ifNotExists()
      .addColumn('id', 'varchar', (col) => col.notNull().unique().primaryKey())
      .addColumn('domain_id', 'varchar', (col) => col.notNull().unique())
      .addColumn('nickname', 'varchar', (col) => col.notNull())
      .addColumn('avatar_url', 'varchar', (col) => col.notNull())
      .addColumn('is_current', 'boolean', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v7;
