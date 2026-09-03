import path from 'node:path';
import fs from 'fs-extra';
import { PGlite, types } from '@electric-sql/pglite';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import { EmbeddedDatabaseLocked } from './errors/embedded-database-locked';
import { isProcessAlive } from 'csdm/node/os/is-process-alive';

let instance: PGlite | undefined;

function getPgliteDataFolderPath() {
  return path.join(getAppFolderPath(), 'database');
}

// PGlite doesn't lock its data folder: opening it from several processes at the same time (the app and the CLI
// typically) could corrupt it. A lock file containing the owner PID guards against it.
// Locks from dead processes (crash, kill…) are simply taken over, so the lock file is never explicitly released.
async function acquireDataFolderLock(dataFolderPath: string) {
  const lockFilePath = path.join(dataFolderPath, 'csdm.lock');
  try {
    const pid = Number(await fs.readFile(lockFilePath, 'utf8'));
    if (pid !== process.pid && isProcessAlive(pid)) {
      throw new EmbeddedDatabaseLocked(pid);
    }
  } catch (error) {
    if (error instanceof EmbeddedDatabaseLocked) {
      throw error;
    }
    // The lock file doesn't exist or is unreadable, take the lock.
  }

  await fs.writeFile(lockFilePath, String(process.pid));
}

export async function createPgliteInstance() {
  // A previous instance may still be open when re-connecting after an error (e.g. a failed schema migration), it has
  // to be closed first because only one connection to the data folder is allowed.
  if (instance !== undefined && !instance.closed) {
    await instance.close();
  }

  const dataFolderPath = getPgliteDataFolderPath();
  await fs.ensureDir(dataFolderPath);
  await acquireDataFolderLock(dataFolderPath);

  // PGlite loads its WASM/data files itself, using fetch() in browser-like environments and fs in Node.
  // Its environment detection is fragile (e.g. it falls back to the browser code paths depending on process.type),
  // loading the files explicitly from the package folder works in every environment (daemon process, CLI).
  const distFolderPath = path.dirname(require.resolve('@electric-sql/pglite'));
  const [pgliteWasm, initdbWasm, fsBundle] = await Promise.all([
    fs.readFile(path.join(distFolderPath, 'pglite.wasm')),
    fs.readFile(path.join(distFolderPath, 'initdb.wasm')),
    fs.readFile(path.join(distFolderPath, 'pglite.data')),
  ]);

  instance = await PGlite.create(dataFolderPath, {
    pgliteWasmModule: await WebAssembly.compile(pgliteWasm),
    initdbWasmModule: await WebAssembly.compile(initdbWasm),
    fsBundle: new Blob([fsBundle]),
    parsers: {
      [types.INT8]: (value: string) => {
        const valueAsNumber = Number(value);
        if (Number.isSafeInteger(valueAsNumber)) {
          return valueAsNumber;
        }

        return value;
      },
      [types.NUMERIC]: Number,
      [types.INT4]: Number,
      [types.INT2]: Number,
    },
  });

  return instance;
}

// The raw PGlite instance is required for queries not supported by Kysely, like COPY with a blob.
export function getPgliteInstance(): PGlite {
  if (instance === undefined || instance.closed) {
    throw new Error('The PGlite instance is not initialized');
  }

  return instance;
}
