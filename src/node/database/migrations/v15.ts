import type { Migration } from './migration';

const v15: Migration = {
  schemaVersion: 15,
  run: async (transaction) => {
    // The kills and rounds tables are frequently filtered by match_checksum and round_number.
    // Without an index those queries is a sequential scan on tables that can hold millions of rows.
    await transaction.schema
      .createIndex('kills_match_checksum_round_number_idx')
      .ifNotExists()
      .on('kills')
      .columns(['match_checksum', 'round_number'])
      .execute();
    await transaction.schema
      .createIndex('rounds_match_checksum_number_idx')
      .ifNotExists()
      .on('rounds')
      .columns(['match_checksum', 'number'])
      .execute();
  },
};

export default v15;
