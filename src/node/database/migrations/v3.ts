import { getDefaultMaps } from '../maps/default-maps';
import { tableHasColumn } from './introspection';
import type { Migration } from './migration';

const v3: Migration = {
  schemaVersion: 3,
  run: async (transaction) => {
    const hasThresholdZColumn = await tableHasColumn(transaction, 'maps', 'threshold_z');
    if (hasThresholdZColumn) {
      return;
    }

    await transaction.schema
      .alterTable('maps')
      .addColumn('threshold_z', 'integer', (col) => {
        return col.notNull().defaultTo(0);
      })
      .execute();

    for (const map of getDefaultMaps()) {
      await transaction
        .updateTable('maps')
        .set({
          threshold_z: map.threshold_z,
        })
        .where('name', '=', map.name)
        .execute();
    }
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v3;
