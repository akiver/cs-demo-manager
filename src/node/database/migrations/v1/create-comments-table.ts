import type { Migration } from '../migration';

const createCommentsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('comments')
      .ifNotExists()
      .addColumn('checksum', 'varchar', (col) => col.notNull().primaryKey())
      .addColumn('comment', 'text', (col) => col.notNull().defaultTo(''))
      .addUniqueConstraint('comments_checksum_comment_unique', ['checksum', 'comment'])
      .execute();
  },
};

export default createCommentsTable;
