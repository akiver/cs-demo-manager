import fs from 'node:fs/promises';
import { constants } from 'node:fs';

export async function isPathWritable(path: string) {
  try {
    await fs.access(path, constants.W_OK);
    return true;
  } catch (error) {
    return false;
  }
}
