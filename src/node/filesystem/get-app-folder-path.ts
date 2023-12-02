import path from 'node:path';
import { homedir } from 'node:os';

export function getAppFolderPath() {
  return path.join(homedir(), IS_DEV ? '.csdm-dev' : '.csdm');
}
