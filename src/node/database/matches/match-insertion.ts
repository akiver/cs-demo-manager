import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { glob } from 'csdm/node/filesystem/glob';

export type InsertOptions = {
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

export async function deleteCsvFilesInOutputFolder(outputFolderPath: string) {
  const files = await glob('*.csv', {
    cwd: outputFolderPath,
    absolute: true,
  });

  await Promise.all(files.map((csvFile) => fs.remove(csvFile)));
}
