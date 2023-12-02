import type { Migration } from '../migration';

const createTeamsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('teams')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('teams_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('current_side', 'int2', (col) => col.notNull())
      .addColumn('score', 'integer', (col) => col.notNull())
      .addColumn('score_first_half', 'integer', (col) => col.notNull())
      .addColumn('score_second_half', 'integer', (col) => col.notNull())
      .addColumn('letter', 'varchar', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createTeamsTable;
