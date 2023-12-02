import type { Migration } from '../migration';

const createPlayerBlindsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('player_blinds')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('player_blinds_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('duration', 'float8', (col) => col.notNull())
      .addColumn('flasher_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('flasher_name', 'varchar', (col) => col.notNull())
      .addColumn('flasher_side', 'int2', (col) => col.notNull())
      .addColumn('is_flasher_controlling_bot', 'boolean', (col) => col.notNull())
      .addColumn('flashed_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('flashed_name', 'varchar', (col) => col.notNull())
      .addColumn('flashed_side', 'int2', (col) => col.notNull())
      .addColumn('is_flashed_controlling_bot', 'boolean', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createPlayerBlindsTable;
