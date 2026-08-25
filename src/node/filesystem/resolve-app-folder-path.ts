import path from 'node:path';
import { homedir } from 'node:os';

export function resolveAppFolderPath(isDev: boolean) {
  if (process.platform !== 'linux') {
    return path.join(homedir(), isDev ? '.csdm-dev' : '.csdm');
  }

  const folderName = isDev ? 'csdm-dev' : 'csdm';
  // https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html#variables
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (typeof xdgConfigHome === 'string' && xdgConfigHome !== '') {
    return path.join(xdgConfigHome, folderName);
  }

  return path.join(homedir(), '.config', folderName);
}
