import type { Migration } from '../migration';

const creatChecksumTagsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('checksum_tags')
      .ifNotExists()
      .addColumn('checksum', 'varchar', (col) => col.notNull())
      .addColumn('tag_id', 'int8', (col) => col.notNull())
      .addUniqueConstraint('checksum_tags_checksum_tag_id_unique', ['checksum', 'tag_id'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default creatChecksumTagsTable;
