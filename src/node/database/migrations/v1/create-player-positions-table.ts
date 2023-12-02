import type { Migration } from '../migration';

const createPlayerPositionsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('player_positions')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint(
        'player_positions_match_checksum_fk',
        ['match_checksum'],
        'matches',
        ['checksum'],
        (cb) => cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('player_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('player_name', 'varchar', (col) => col.notNull())
      .addColumn('is_alive', 'boolean', (col) => col.notNull())
      .addColumn('x', 'float8', (col) => col.notNull())
      .addColumn('y', 'float8', (col) => col.notNull())
      .addColumn('z', 'float8', (col) => col.notNull())
      .addColumn('yaw', 'float8', (col) => col.notNull())
      .addColumn('flash_duration_remaining', 'float8', (col) => col.notNull())
      .addColumn('side', 'int2', (col) => col.notNull())
      .addColumn('health', 'integer', (col) => col.notNull())
      .addColumn('money', 'integer', (col) => col.notNull())
      .addColumn('armor', 'integer', (col) => col.notNull())
      .addColumn('has_helmet', 'boolean', (col) => col.notNull())
      .addColumn('has_bomb', 'boolean', (col) => col.notNull())
      .addColumn('has_defuse_kit', 'boolean', (col) => col.notNull())
      .addColumn('is_ducking', 'boolean', (col) => col.notNull())
      .addColumn('is_airborne', 'boolean', (col) => col.notNull())
      .addColumn('is_scoping', 'boolean', (col) => col.notNull())
      .addColumn('is_defusing', 'boolean', (col) => col.notNull())
      .addColumn('is_planting', 'boolean', (col) => col.notNull())
      .addColumn('is_grabbing_hostage', 'boolean', (col) => col.notNull())
      .addColumn('active_weapon_name', 'varchar')
      .addColumn('equipments', 'varchar')
      .addColumn('grenades', 'varchar')
      .addColumn('pistols', 'varchar')
      .addColumn('smgs', 'varchar')
      .addColumn('rifles', 'varchar')
      .addColumn('heavy', 'varchar')
      .execute();

    await transaction.schema
      .createIndex('player_positions_match_checksum_round_number_idx')
      .ifNotExists()
      .on('player_positions')
      .columns(['match_checksum', 'round_number'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createPlayerPositionsTable;
