import { createRoundCommentsTable } from './create-table/create-round-comments-table';
import type { Migration } from './migration';

const v10: Migration = {
  schemaVersion: 10,
  run: async (transaction) => {
    await createRoundCommentsTable(transaction);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v10;
