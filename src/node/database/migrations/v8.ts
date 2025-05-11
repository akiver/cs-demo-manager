import { insertDefaultMaps } from '../maps/insert-default-maps';
import type { Migration } from './migration';

const v8: Migration = {
  schemaVersion: 8,
  run: async (transaction) => {
    // Insert maps from the May 9, 2025 update
    await insertDefaultMaps(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v8;
