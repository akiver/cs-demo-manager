import type { Migration } from '../migration';

const createFaceitMatchTeamsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('faceit_match_teams')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('faceit_id', 'varchar', (col) => col.notNull())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('score', 'integer', (col) => col.notNull())
      .addColumn('first_half_score', 'integer', (col) => col.notNull())
      .addColumn('second_half_score', 'integer', (col) => col.notNull())
      .addColumn('overtime_score', 'integer', (col) => col.notNull())
      .addColumn('faceit_match_id', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('faceit_match_teams_match_id_fk', ['faceit_match_id'], 'faceit_matches', ['id'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addUniqueConstraint('faceit_match_teams_faceit_id_faceit_match_id_unique', ['faceit_id', 'faceit_match_id'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createFaceitMatchTeamsTable;
