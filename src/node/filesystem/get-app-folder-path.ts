import path from 'node:path';
import { homedir } from 'node:os';
import { isLinux } from 'csdm/node/os/is-linux';

export function getAppFolderPath() {
  if (!isLinux) {
    return path.join(homedir(), IS_DEV ? '.csdm-dev' : '.csdm');
  }

  const folderName = IS_DEV ? 'csdm-dev' : 'csdm';
  // https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html#variables
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (typeof xdgConfigHome === 'string' && xdgConfigHome !== '') {
    return path.join(xdgConfigHome, folderName);
  }

  return path.join(homedir(), '.config', folderName);
}
