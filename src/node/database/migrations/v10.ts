import { createRoundCommentsTable } from './create-table/create-round-comments-table';
import { createCamerasTable } from './create-table/create-cameras-table';
import type { Migration } from './migration';
import { insertDefaultCameras } from '../cameras/insert-default-cameras';

const v10: Migration = {
  schemaVersion: 10,
  run: async (transaction) => {
    await createRoundCommentsTable(transaction);
    await createCamerasTable(transaction);
    await insertDefaultCameras(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v10;
