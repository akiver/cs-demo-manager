import fs from 'fs-extra';
import type { TableName } from './table-name';
import type { ColumnState } from './column-state';
import { getTableStateFilePath } from './get-table-state-file-path';

export async function writeTableState(tableName: TableName, columns: ColumnState[]) {
  try {
    const settingsFilePath = getTableStateFilePath(tableName);
    await fs.ensureFile(settingsFilePath);
    const json = JSON.stringify(columns, null, 2);
    await fs.writeFile(settingsFilePath, json);
  } catch (error) {
    logger.error('Error while writing table settings', tableName);
    logger.error(error);
    throw error;
  }
}
