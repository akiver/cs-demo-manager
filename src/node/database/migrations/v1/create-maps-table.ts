import type { Migration } from '../migration';
import { getDefaultMaps } from 'csdm/node/database/maps/default-maps';

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

    await transaction
      .insertInto('maps')
      .values(getDefaultMaps())
      .onConflict((oc) => oc.constraint('maps_name_game_unique').doNothing())
      .execute();
  },
};

// eslint-disable-next-line no-restricted-syntax
export default createMapsTable;
