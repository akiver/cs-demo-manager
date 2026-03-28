import type { Migration } from './migration';
import { insertDefaultMaps } from '../maps/insert-default-maps';

const v11: Migration = {
  schemaVersion: 11,
  run: async (transaction) => {
    await insertDefaultMaps(transaction);
  },
};

export default v11;
