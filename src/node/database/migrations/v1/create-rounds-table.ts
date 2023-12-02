import type { Migration } from '../migration';

const createRoundsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('rounds')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint('rounds_match_checksum_fk', ['match_checksum'], 'matches', ['checksum'], (cb) =>
        cb.onDelete('cascade'),
      )
      .addColumn('number', 'integer', (col) => col.notNull())
      .addColumn('start_tick', 'integer', (col) => col.notNull())
      .addColumn('start_frame', 'integer', (col) => col.notNull())
      .addColumn('freeze_time_end_tick', 'integer', (col) => col.notNull())
      .addColumn('freeze_time_end_frame', 'integer', (col) => col.notNull())
      .addColumn('end_tick', 'integer', (col) => col.notNull())
      .addColumn('end_frame', 'integer', (col) => col.notNull())
      .addColumn('end_officially_tick', 'integer', (col) => col.notNull())
      .addColumn('end_officially_frame', 'integer', (col) => col.notNull())
      .addColumn('team_a_name', 'varchar', (col) => col.notNull())
      .addColumn('team_b_name', 'varchar', (col) => col.notNull())
      .addColumn('team_a_score', 'integer', (col) => col.notNull())
      .addColumn('team_b_score', 'integer', (col) => col.notNull())
      .addColumn('team_a_side', 'int2', (col) => col.notNull())
      .addColumn('team_b_side', 'int2', (col) => col.notNull())
      .addColumn('team_a_start_money', 'integer', (col) => col.notNull())
      .addColumn('team_b_start_money', 'integer', (col) => col.notNull())
      .addColumn('team_a_equipment_value', 'integer', (col) => col.notNull())
      .addColumn('team_b_equipment_value', 'integer', (col) => col.notNull())
      .addColumn('team_a_money_spent', 'integer', (col) => col.notNull())
      .addColumn('team_b_money_spent', 'integer', (col) => col.notNull())
      .addColumn('team_a_economy_type', 'varchar', (col) => col.notNull())
      .addColumn('team_b_economy_type', 'varchar', (col) => col.notNull())
      .addColumn('duration', 'integer', (col) => col.notNull())
      .addColumn('end_reason', 'int2', (col) => col.notNull())
      .addColumn('winner_name', 'varchar', (col) => col.notNull())
      .addColumn('winner_side', 'int2', (col) => col.notNull())
      .addColumn('overtime_number', 'integer', (col) => col.notNull().defaultTo(0))
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createRoundsTable;
