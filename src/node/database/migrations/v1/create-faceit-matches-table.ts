import type { Migration } from '../migration';

const createFaceitMatchesTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('faceit_matches')
      .ifNotExists()
      .addColumn('id', 'varchar', (col) => col.notNull().unique().primaryKey())
      .addColumn('game', 'varchar', (col) => col.notNull())
      .addColumn('date', 'timestamptz', (col) => col.notNull())
      .addColumn('duration_in_seconds', 'integer', (col) => col.notNull())
      .addColumn('demo_url', 'varchar', (col) => col.notNull())
      .addColumn('map_name', 'varchar', (col) => col.notNull())
      .addColumn('url', 'varchar', (col) => col.notNull())
      .addColumn('game_mode', 'varchar', (col) => col.notNull())
      .addColumn('winner_id', 'varchar', (col) => col.notNull())
      .addColumn('winner_name', 'varchar', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createFaceitMatchesTable;
