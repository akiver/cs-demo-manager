import type { Migration } from '../migration';

const createDemosTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('demos')
      .ifNotExists()
      .addColumn('checksum', 'varchar', (col) => col.notNull().primaryKey())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('game', 'varchar', (col) => col.notNull())
      .addColumn('source', 'varchar', (col) => col.notNull())
      .addColumn('type', 'varchar', (col) => col.notNull())
      .addColumn('date', 'timestamptz', (col) => col.notNull())
      .addColumn('map_name', 'varchar', (col) => col.notNull())
      .addColumn('tick_count', 'integer', (col) => col.notNull())
      .addColumn('tickrate', 'double precision', (col) => col.notNull())
      .addColumn('framerate', 'double precision', (col) => col.notNull())
      .addColumn('duration', 'double precision', (col) => col.notNull())
      .addColumn('server_name', 'varchar', (col) => col.notNull())
      .addColumn('client_name', 'varchar', (col) => col.notNull())
      .addColumn('network_protocol', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('build_number', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('share_code', 'varchar', (col) => col.defaultTo(''))
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createDemosTable;
