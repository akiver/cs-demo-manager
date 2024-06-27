import { insertDefaultMaps } from 'csdm/node/database/maps/insert-default-maps';
import type { Migration } from './migration';

const v5: Migration = {
  schemaVersion: 5,
  run: async (transaction) => {
    await insertDefaultMaps(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v5;
