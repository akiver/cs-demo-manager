import type { Migration } from '../migration';

const createFaceitMatchPlayersTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('faceit_match_players')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('faceit_id', 'varchar', (col) => col.notNull())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('avatar_url', 'varchar', (col) => col.notNull())
      .addColumn('team_id', 'varchar', (col) => col.notNull())
      .addColumn('team_name', 'varchar', (col) => col.notNull())
      .addColumn('kill_count', 'integer', (col) => col.notNull())
      .addColumn('assist_count', 'integer', (col) => col.notNull())
      .addColumn('death_count', 'integer', (col) => col.notNull())
      .addColumn('headshot_count', 'integer', (col) => col.notNull())
      .addColumn('headshot_percentage', 'float4', (col) => col.notNull())
      .addColumn('kill_death_ratio', 'float4', (col) => col.notNull())
      .addColumn('kill_per_round', 'float4', (col) => col.notNull())
      .addColumn('mvp_count', 'integer', (col) => col.notNull())
      .addColumn('three_kill_count', 'integer', (col) => col.notNull())
      .addColumn('four_kill_count', 'integer', (col) => col.notNull())
      .addColumn('five_kill_count', 'integer', (col) => col.notNull())
      .addColumn('faceit_match_id', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint(
        'faceit_match_players_match_id_fk',
        ['faceit_match_id'],
        'faceit_matches',
        ['id'],
        (cb) => cb.onDelete('cascade'),
      )
      .addUniqueConstraint('faceit_match_players_faceit_id_faceit_match_id_unique', ['faceit_id', 'faceit_match_id'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createFaceitMatchPlayersTable;
