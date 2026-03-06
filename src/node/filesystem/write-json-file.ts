import fs from 'fs-extra';
import { isValidJson } from 'csdm/common/json';
import { InvalidFileExtension } from '../errors/invalid-file-extension';
import { InvalidJson } from '../errors/invalid-json';

export async function writeJsonFile(filePath: string, data: string) {
  if (!filePath.endsWith('.json')) {
    throw new InvalidFileExtension();
  }

  if (!isValidJson(data)) {
    throw new InvalidJson();
  }

  await fs.writeFile(filePath, data);
}
