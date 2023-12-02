import fs from 'fs-extra';
import { TableName } from './table-name';
import { getTableStateFilePath } from './get-table-state-file-path';

export async function resetTablesState() {
  const removeFilePromise: Promise<void>[] = [];
  for (const tableName of Object.values(TableName)) {
    const filePath = getTableStateFilePath(tableName);
    removeFilePromise.push(fs.remove(filePath));
  }

  await Promise.all(removeFilePromise);
}
