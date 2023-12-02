import type { Migration } from '../migration';

const createDecoysStartTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('decoys_start')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('decoys_start_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('thrower_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('thrower_name', 'varchar', (col) => col.notNull())
      .addColumn('thrower_team_name', 'varchar', (col) => col.notNull())
      .addColumn('thrower_side', 'int2', (col) => col.notNull())
      .addColumn('thrower_velocity_x', 'float8', (col) => col.notNull())
      .addColumn('thrower_velocity_y', 'float8', (col) => col.notNull())
      .addColumn('thrower_velocity_z', 'float8', (col) => col.notNull())
      .addColumn('thrower_yaw', 'float8', (col) => col.notNull())
      .addColumn('thrower_pitch', 'float8', (col) => col.notNull())
      .addColumn('grenade_id', 'varchar', (col) => col.notNull())
      .addColumn('projectile_id', 'varchar', (col) => col.notNull())
      .addColumn('x', 'float8', (col) => col.notNull())
      .addColumn('y', 'float8', (col) => col.notNull())
      .addColumn('z', 'float8', (col) => col.notNull())
      .execute();

    await transaction.schema
      .createIndex('decoys_start_match_checksum_round_number_idx')
      .ifNotExists()
      .on('decoys_start')
      .columns(['match_checksum', 'round_number'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createDecoysStartTable;
