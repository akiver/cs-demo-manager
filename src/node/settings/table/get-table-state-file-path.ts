import path from 'node:path';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import type { TableName } from './table-name';

export function getTableStateFilePath(tableName: TableName) {
  return path.resolve(getAppFolderPath(), 'tables', `${tableName}.json`);
}
