import fs from 'fs-extra';
import type { TableName } from './table-name';
import type { ColumnState } from './column-state';
import { getTableStateFilePath } from './get-table-state-file-path';

export async function readTableState(tableName: TableName): Promise<ColumnState[]> {
  const settingsFilePath = getTableStateFilePath(tableName);
  const settingsFileExists = await fs.pathExists(settingsFilePath);
  if (!settingsFileExists) {
    return [];
  }

  try {
    const json = await fs.readFile(settingsFilePath, 'utf8');
    const columns: ColumnState[] = JSON.parse(json);
    return columns;
  } catch (error) {
    logger.error(`Error reading table state file: ${settingsFilePath}`);
    logger.error(error);
    return [];
  }
}
