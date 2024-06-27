import { insertDefaultMaps } from 'csdm/node/database/maps/insert-default-maps';
import type { Migration } from '../migration';

const createMapsTable: Migration = {
  schemaVersion: 1,
  run: async (transaction) => {
    await transaction.schema
      .createTable('maps')
      .ifNotExists()
      .addColumn('id', 'bigserial', (col) => col.primaryKey().notNull())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('game', 'varchar', (col) => col.notNull())
      .addColumn('position_x', 'integer', (col) => col.notNull())
      .addColumn('position_y', 'integer', (col) => col.notNull())
      .addColumn('scale', 'float4', (col) => col.notNull())
      .addColumn('threshold_z', 'integer', (col) => {
        return col.notNull().defaultTo(0);
      })
      .addUniqueConstraint('maps_name_game_unique', ['name', 'game'])
      .execute();

    await insertDefaultMaps(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createMapsTable;
