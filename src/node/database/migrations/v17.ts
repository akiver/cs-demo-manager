import { sql } from 'kysely';
import type { Migration } from './migration';

const v17: Migration = {
  schemaVersion: 17,
  run: async (transaction) => {
    // The CS2 scoreboard counts an enemy as flashed only if they were facing the flashbang.
    // Blinds from demos analyzed before this column existed keep being counted.
    await transaction.schema
      .alterTable('player_blinds')
      .addColumn('is_flashed_facing_flashbang', 'boolean', (col) => col.notNull().defaultTo(true))
      .execute();

    // Time between the moment a player saw an enemy and damaged/killed them in milliseconds, computed by the analyzer
    // for CS2 demos when the map geometry is available, -1 otherwise.
    await transaction.schema
      .alterTable('damages')
      .addColumn('time_to_damage', 'integer', (col) => col.notNull().defaultTo(-1))
      .execute();
    await transaction.schema
      .alterTable('kills')
      .addColumn('time_to_kill', 'integer', (col) => col.notNull().defaultTo(-1))
      .execute();
    await transaction.schema
      .alterTable('players')
      .addColumn('average_time_to_damage', 'float8', (col) => col.notNull().defaultTo(-1))
      .addColumn('average_time_to_kill', 'float8', (col) => col.notNull().defaultTo(-1))
      .execute();
    // SHA-256 of the map geometry file used to compute the time to damage/kill, null if there was none.
    await transaction.schema.alterTable('matches').addColumn('map_geometry_checksum', 'varchar').execute();

    // Players' average time to damage/kill across matches are computed from the damages and kills tables.
    // Only the first damage of an engagement has a time to damage, partial indexes keep these indexes small.
    await transaction.schema
      .createIndex('damages_attacker_steam_id_time_to_damage_idx')
      .on('damages')
      .column('attacker_steam_id')
      .where(sql.ref('time_to_damage'), '>=', 0)
      .execute();
    await transaction.schema
      .createIndex('kills_killer_steam_id_time_to_kill_idx')
      .on('kills')
      .column('killer_steam_id')
      .where(sql.ref('time_to_kill'), '>=', 0)
      .execute();
  },
};

export default v17;
