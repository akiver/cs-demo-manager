import type { Migration } from '../migration';

const createPlayerCommentsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('player_comments')
      .ifNotExists()
      .addColumn('steam_id', 'varchar', (col) => col.notNull().primaryKey())
      .addColumn('comment', 'text', (col) => col.notNull().defaultTo(''))
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createPlayerCommentsTable;
