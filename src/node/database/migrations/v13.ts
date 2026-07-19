import type { Migration } from './migration';
import { insertDefaultMaps } from '../maps/insert-default-maps';

const v13: Migration = {
  schemaVersion: 13,
  run: async (transaction) => {
    await insertDefaultMaps(transaction);
  },
};

export default v13;
