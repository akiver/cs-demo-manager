import type { Migration } from '../migration';

const createDamagesTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('damages')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('damages_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tick', 'integer', (col) => col.notNull())
      .addColumn('frame', 'integer', (col) => col.notNull())
      .addColumn('health_damage', 'integer', (col) => col.notNull())
      .addColumn('armor_damage', 'integer', (col) => col.notNull())
      .addColumn('victim_health', 'integer', (col) => col.notNull())
      .addColumn('victim_new_health', 'integer', (col) => col.notNull())
      .addColumn('victim_armor', 'integer', (col) => col.notNull())
      .addColumn('victim_new_armor', 'integer', (col) => col.notNull())
      .addColumn('is_victim_controlling_bot', 'boolean', (col) => col.notNull())
      .addColumn('hitgroup', 'int2', (col) => col.notNull())
      .addColumn('weapon_name', 'varchar', (col) => col.notNull())
      .addColumn('weapon_type', 'varchar', (col) => col.notNull())
      .addColumn('attacker_steam_id', 'varchar')
      .addColumn('attacker_side', 'int2', (col) => col.notNull())
      .addColumn('attacker_team_name', 'varchar')
      .addColumn('is_attacker_controlling_bot', 'boolean', (col) => col.notNull())
      .addColumn('victim_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('victim_side', 'int2', (col) => col.notNull())
      .addColumn('victim_team_name', 'varchar', (col) => col.notNull())
      .addColumn('weapon_unique_id', 'varchar', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createDamagesTable;
