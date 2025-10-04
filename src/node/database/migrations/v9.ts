import { insertDefaultMaps } from '../maps/insert-default-maps';
import type { Migration } from './migration';

const v9: Migration = {
  schemaVersion: 9,
  run: async (transaction) => {
    // Insert maps from the 02/10/2025 update
    await insertDefaultMaps(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v9;
