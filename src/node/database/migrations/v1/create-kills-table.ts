import type { Migration } from '../migration';

const createKillsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('kills')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('kills_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('killer_steam_id', 'varchar', (col) => col.defaultTo(null))
      .addColumn('killer_name', 'varchar', (col) => col.defaultTo(null))
      .addColumn('killer_team_name', 'varchar', (col) => col.defaultTo(null))
      .addColumn('killer_side', 'int2', (col) => col.defaultTo(null))
      .addColumn('victim_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('victim_name', 'varchar', (col) => col.notNull())
      .addColumn('victim_team_name', 'varchar', (col) => col.notNull())
      .addColumn('victim_side', 'int2', (col) => col.notNull())
      .addColumn('assister_steam_id', 'varchar', (col) => col.defaultTo(null))
      .addColumn('assister_name', 'varchar', (col) => col.defaultTo(null))
      .addColumn('assister_team_name', 'varchar', (col) => col.defaultTo(null))
      .addColumn('assister_side', 'int2', (col) => col.defaultTo(null))
      .addColumn('is_headshot', 'boolean', (col) => col.notNull())
      .addColumn('is_assisted_flash', 'boolean', (col) => col.notNull())
      .addColumn('penetrated_objects', 'integer', (col) => col.notNull())
      .addColumn('killer_x', 'float8', (col) => col.notNull())
      .addColumn('killer_y', 'float8', (col) => col.notNull())
      .addColumn('killer_z', 'float8', (col) => col.notNull())
      .addColumn('is_killer_airborne', 'boolean', (col) => col.notNull())
      .addColumn('is_killer_blinded', 'boolean', (col) => col.notNull())
      .addColumn('victim_x', 'float8', (col) => col.notNull())
      .addColumn('victim_y', 'float8', (col) => col.notNull())
      .addColumn('victim_z', 'float8', (col) => col.notNull())
      .addColumn('is_victim_airborne', 'boolean', (col) => col.notNull())
      .addColumn('is_victim_blinded', 'boolean', (col) => col.notNull())
      .addColumn('is_victim_inspecting_weapon', 'boolean', (col) => col.notNull())
      .addColumn('assister_x', 'float8', (col) => col.notNull())
      .addColumn('assister_y', 'float8', (col) => col.notNull())
      .addColumn('assister_z', 'float8', (col) => col.notNull())
      .addColumn('weapon_name', 'varchar', (col) => col.notNull())
      .addColumn('weapon_type', 'varchar', (col) => col.notNull())
      .addColumn('is_killer_controlling_bot', 'boolean', (col) => col.notNull())
      .addColumn('is_victim_controlling_bot', 'boolean', (col) => col.notNull())
      .addColumn('is_assister_controlling_bot', 'boolean', (col) => col.notNull())
      .addColumn('is_trade_kill', 'boolean', (col) => col.notNull())
      .addColumn('is_trade_death', 'boolean', (col) => col.notNull())
      .addColumn('is_through_smoke', 'boolean', (col) => col.notNull())
      .addColumn('is_no_scope', 'boolean', (col) => col.notNull())
      .addColumn('distance', 'float8', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createKillsTable;
