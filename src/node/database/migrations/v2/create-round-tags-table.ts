import type { Migration } from '../migration';

const createRoundTagsTable: Migration = {
  schemaVersion: 2,
  run: async (transaction) => {
    await transaction.schema
      .createTable('round_tags')
      .ifNotExists()
      .addColumn('checksum', 'varchar', (col) => col.notNull())
      .addColumn('round_number', 'integer', (col) => col.notNull())
      .addColumn('tag_id', 'int8', (col) => col.notNull())
      .addUniqueConstraint('round_tags_checksum_round_number_tag_id_unique', ['checksum', 'round_number', 'tag_id'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createRoundTagsTable;
