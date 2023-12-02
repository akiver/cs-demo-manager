import type { Migration } from '../migration';

const createPlayerEconomiesTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('player_economies')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('match_checksum', 'varchar', (col) => col.notNull())
      .addForeignKeyConstraint(
        'player_economies_match_checksum_fk',
        ['match_checksum'],
        'matches',
        ['checksum'],
        (cb) => cb.onDelete('cascade'),
      )
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('player_steam_id', 'varchar', (col) => col.notNull())
      .addColumn('player_name', 'varchar', (col) => col.notNull())
      .addColumn('player_side', 'int2', (col) => col.defaultTo(null))
      .addColumn('start_money', 'integer', (col) => col.notNull())
      .addColumn('money_spent', 'integer', (col) => col.notNull())
      .addColumn('equipment_value', 'integer', (col) => col.notNull())
      .addColumn('type', 'varchar', (col) => col.notNull())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createPlayerEconomiesTable;
