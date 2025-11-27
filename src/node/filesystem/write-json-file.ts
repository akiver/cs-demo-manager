import fs from 'fs-extra';
import { isValidJson } from 'csdm/common/json';

export async function writeJsonFile(filePath: string, data: string) {
  if (!filePath.endsWith('.json')) {
    throw new Error('File must end with .json extension');
  }

  if (!isValidJson(data)) {
    throw new Error('Invalid JSON data');
  }

  await fs.writeFile(filePath, data);
}
