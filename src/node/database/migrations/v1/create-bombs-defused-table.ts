import type { Migration } from '../migration';

const createBombsDefusedTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('bombs_defused')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('bombs_defused_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('site', 'varchar', (col) => col.notNull())
      .addColumn('defuser_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('defuser_name', 'varchar', (col) => col.notNull())
      .addColumn('is_defuser_controlling_bot', 'boolean', (col) => col.notNull())
      .addColumn('x', 'float8', (col) => col.notNull())
      .addColumn('y', 'float8', (col) => col.notNull())
      .addColumn('z', 'float8', (col) => col.notNull())
      .addColumn('ct_alive_count', 'integer', (col) => col.notNull())
      .addColumn('t_alive_count', 'integer', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createBombsDefusedTable;
