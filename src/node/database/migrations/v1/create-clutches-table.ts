import type { Migration } from '../migration';

const createClutchesTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('clutches')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('clutches_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('clutcher_name', 'varchar', (col) => col.notNull())
      .addColumn('clutcher_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('won', 'boolean', (col) => col.notNull())
      .addColumn('side', 'int2', (col) => col.notNull())
      .addColumn('opponent_count', 'integer', (col) => col.notNull())
      .addColumn('has_clutcher_survived', 'boolean', (col) => col.notNull())
      .addColumn('clutcher_kill_count', 'integer', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createClutchesTable;
