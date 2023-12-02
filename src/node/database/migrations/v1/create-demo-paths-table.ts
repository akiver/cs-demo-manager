import type { Migration } from '../migration';

const createDemoPathsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('demo_paths')
      .ifNotExists()
      .addColumn('checksum', 'varchar', (col) => col.notNull())
      .addColumn('file_path', 'varchar', (col) => col.notNull())
      .addPrimaryKeyConstraint('demo_paths_pk', ['checksum', 'file_path'])
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createDemoPathsTable;
