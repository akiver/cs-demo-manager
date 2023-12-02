import path from 'node:path';
import os from 'node:os';
import glob from 'tiny-glob';
import fs from 'fs-extra';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { Database } from 'csdm/node/database/schema';
import { executePsql } from 'csdm/node/database/psql/execute-psql';

export type InsertOptions = {
  databaseSettings: DatabaseSettings;
  outputFolderPath: string;
  demoName: string;
};

export function getOutputFolderPath() {
  return path.resolve(os.tmpdir(), 'cs-demo-manager');
}

export function getDemoNameFromPath(demoPath: string) {
  return path.parse(demoPath).name;
}

export function getCsvFilePath(outputFolderPath: string, demoName: string, csvFileSuffix: string) {
  return path.resolve(outputFolderPath, `${demoName}${csvFileSuffix}`);
}

type InsertFromCsvOptions<Table> = {
  databaseSettings: DatabaseSettings;
  csvFilePath: string;
  tableName: keyof Database;
  columns: Array<keyof Table>;
};

export async function insertFromCsv<Table>({
  columns,
  csvFilePath,
  databaseSettings,
  tableName,
}: InsertFromCsvOptions<Table>) {
  const { database, username, hostname, port, password } = databaseSettings;
  const columnNames = columns.join(',');
  const command = `-c "\\copy ${tableName}(${columnNames}) FROM '${csvFilePath}' CSV DELIMITER ','" "postgresql://${username}:${password}@${hostname}:${port}/${database}"`;
  await executePsql(command);
}

export async function deleteCsvFilesInOutputFolder(outputFolderPath: string) {
  const csvFiles = await glob('*.csv', {
    cwd: outputFolderPath,
    absolute: true,
    filesOnly: true,
  });

  for (const csvFile of csvFiles) {
    await fs.remove(csvFile);
  }
}
