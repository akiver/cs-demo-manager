import path from 'node:path';
import { getStaticFolderPath } from './get-static-folder-path';

export function getImagesFolderPath(): string {
  return path.join(getStaticFolderPath(), 'images');
}
