import type { Migration } from '../migration';

const createPlayerBuysTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('player_buys')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('player_buys_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('player_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('player_name', 'varchar', (col) => col.notNull())
      .addColumn('player_side', 'int2', (col) => col.notNull())
      .addColumn('weapon_name', 'varchar', (col) => col.notNull())
      .addColumn('weapon_type', 'varchar', (col) => col.notNull())
      .addColumn('weapon_unique_id', 'varchar', (col) => col.notNull())
      .addColumn('has_refunded', 'boolean', (col) => col.notNull().defaultTo(false))
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createPlayerBuysTable;
