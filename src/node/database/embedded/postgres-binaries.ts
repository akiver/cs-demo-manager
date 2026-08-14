import path from 'node:path';
import fs from 'fs-extra';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { EmbeddedPostgresBinariesMissing } from './errors/embedded-postgres-binaries-missing';

export type PostgresBinaryName = 'postgres' | 'initdb' | 'pg_ctl';

function getPostgresFolderPath() {
  return path.join(getStaticFolderPath(), 'postgres');
}

export function getPostgresBinaryPath(name: PostgresBinaryName) {
  const extension = process.platform === 'win32' ? '.exe' : '';

  return path.join(getPostgresFolderPath(), 'bin', `${name}${extension}`);
}

// PostgreSQL major version of the bundled binaries, written by scripts/install-deps.mjs.
export async function getBundledPostgresVersion() {
  const version = await fs.readFile(path.join(getPostgresFolderPath(), 'VERSION'), 'utf8');

  return version.trim();
}

export async function ensurePostgresBinariesExist() {
  const binaryNames: PostgresBinaryName[] = ['postgres', 'initdb', 'pg_ctl'];
  for (const name of binaryNames) {
    const binaryPath = getPostgresBinaryPath(name);
    if (!(await fs.pathExists(binaryPath))) {
      throw new EmbeddedPostgresBinariesMissing(binaryPath);
    }
  }
}

export function buildPostgresEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    // The bundled distribution ships without translated message catalogs, forcing C also makes the
    // cluster errors we surface in the UI predictable.
    LC_MESSAGES: 'C',
  };

  if (process.platform === 'linux') {
    // ! Not done on macOS: the hardened runtime strips DYLD_* variables, the Mach-O binaries rely on
    // their @loader_path rpath instead.
    env.LD_LIBRARY_PATH = [path.join(getPostgresFolderPath(), 'lib'), process.env.LD_LIBRARY_PATH]
      .filter((value) => {
        return typeof value === 'string' && value !== '';
      })
      .join(path.delimiter);
  }

  return env;
}
