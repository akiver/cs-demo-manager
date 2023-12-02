import { sql } from 'kysely';
import type { Migration } from '../migration';

const createPlayersTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('players')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('players_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('steam_id', 'varchar', (col) => col.notNull())
      .addColumn('index', 'int2', (col) => col.notNull())
      .addColumn('team_name', 'varchar', (col) => col.notNull())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('kill_count', 'integer', (col) => col.notNull())
      .addColumn('death_count', 'integer', (col) => col.notNull())
      .addColumn('assist_count', 'integer', (col) => col.notNull())
      .addColumn('kill_death_ratio', 'float4', (col) =>
        col
          .notNull()
          .generatedAlwaysAs(sql`ROUND(kill_count/GREATEST(death_count,1)::numeric, 2)`)
          .stored(),
      )
      .addColumn('headshot_count', 'integer', (col) => col.notNull())
      .addColumn('headshot_percentage', 'float4', (col) =>
        col
          .notNull()
          .generatedAlwaysAs(sql`ROUND(headshot_count*100/GREATEST(kill_count,1))`)
          .stored(),
      )
      .addColumn('damage_health', 'integer', (col) => col.notNull())
      .addColumn('damage_armor', 'integer', (col) => col.notNull())
      .addColumn('first_kill_count', 'integer', (col) => col.notNull())
      .addColumn('first_death_count', 'integer', (col) => col.notNull())
      .addColumn('mvp_count', 'integer', (col) => col.notNull())
      .addColumn('average_damage_per_round', 'float4', (col) => col.notNull())
      .addColumn('average_kill_per_round', 'float4', (col) => col.notNull())
      .addColumn('average_death_per_round', 'float4', (col) => col.notNull())
      .addColumn('utility_damage_per_round', 'float4', (col) => col.notNull())
      .addColumn('rank_type', 'integer', (col) => col.notNull())
      .addColumn('rank', 'integer', (col) => col.notNull())
      .addColumn('old_rank', 'integer', (col) => col.notNull())
      .addColumn('wins_count', 'integer', (col) => col.notNull())
      .addColumn('bomb_planted_count', 'integer', (col) => col.notNull())
      .addColumn('bomb_defused_count', 'integer', (col) => col.notNull())
      .addColumn('hostage_rescued_count', 'integer', (col) => col.notNull())
      .addColumn('score', 'integer', (col) => col.notNull())
      .addColumn('kast', 'float4', (col) => col.notNull())
      .addColumn('hltv_rating', 'float4', (col) => col.notNull())
      .addColumn('hltv_rating_2', 'float4', (col) => col.notNull())
      .addColumn('utility_damage', 'integer', (col) => col.notNull())
      .addColumn('trade_kill_count', 'integer', (col) => col.notNull())
      .addColumn('trade_death_count', 'integer', (col) => col.notNull())
      .addColumn('first_trade_kill_count', 'integer', (col) => col.notNull())
      .addColumn('first_trade_death_count', 'integer', (col) => col.notNull())
      .addColumn('one_kill_count', 'integer', (col) => col.notNull())
      .addColumn('two_kill_count', 'integer', (col) => col.notNull())
      .addColumn('three_kill_count', 'integer', (col) => col.notNull())
      .addColumn('four_kill_count', 'integer', (col) => col.notNull())
      .addColumn('five_kill_count', 'integer', (col) => col.notNull())
      .addColumn('inspect_weapon_count', 'integer', (col) => col.notNull())
      .addColumn('color', 'integer', (col) => col.notNull())
      .addColumn('crosshair_share_code', 'varchar', (col) => col.defaultTo(null))
      .addUniqueConstraint('players_steam_id_match_checksum_unique', ['steam_id', 'match_checksum'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createPlayersTable;
