import type { Migration } from '../migration';

const createInfernoPositionsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('inferno_positions')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint(
        'inferno_position_match_checksum_fk',
        ['match_checksum'],
        'matches',
        ['checksum'],
        (cb) => cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('thrower_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('thrower_name', 'varchar', (col) => col.notNull())
      .addColumn('unique_id', 'varchar', (col) => col.notNull())
      .addColumn('convex_hull_2d', 'varchar', (col) => col.notNull())
      .addColumn('x', 'float8', (col) => col.notNull())
      .addColumn('y', 'float8', (col) => col.notNull())
      .addColumn('z', 'float8', (col) => col.notNull())
      .execute();

    await transaction.schema
      .createIndex('inferno_positions_match_checksum_round_number_idx')
      .ifNotExists()
      .on('inferno_positions')
      .columns(['match_checksum', 'round_number'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createInfernoPositionsTable;
