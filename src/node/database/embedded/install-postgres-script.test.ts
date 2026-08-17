import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

const execFileAsync = promisify(execFile);
let testFolderPath: string;

beforeEach(async () => {
  testFolderPath = await fs.mkdtemp(path.join(os.tmpdir(), 'csdm-postgres-install-script-test-'));
});

afterEach(async () => {
  await fs.remove(testFolderPath);
});

describe('PostgreSQL binaries installation', () => {
  it('should keep the new installation when a locked previous folder cannot be removed', async () => {
    const stagingFolderPath = path.join(testFolderPath, 'staging');
    const destinationFolderPath = path.join(testFolderPath, 'destination');
    const backupFolderPath = path.join(testFolderPath, 'backup');
    await Promise.all([
      fs.outputFile(path.join(stagingFolderPath, 'version'), 'new'),
      fs.outputFile(path.join(destinationFolderPath, 'version'), 'old'),
    ]);

    const installScriptUrl = pathToFileURL(path.join(process.cwd(), 'scripts', 'install-deps.mjs')).href;
    const script = `
      import fs from 'fs-extra';
      import { swapPostgresFolder } from ${JSON.stringify(installScriptUrl)};
      const originalRemove = fs.remove;
      fs.remove = async (folderPath) => {
        if (folderPath === ${JSON.stringify(backupFolderPath)}) {
          const error = new Error('locked');
          error.code = 'EPERM';
          throw error;
        }
        return originalRemove(folderPath);
      };
      await swapPostgresFolder(
        ${JSON.stringify(stagingFolderPath)},
        ${JSON.stringify(destinationFolderPath)},
        ${JSON.stringify(backupFolderPath)},
      );
    `;

    await execFileAsync(process.execPath, ['--input-type=module', '--eval', script], { cwd: process.cwd() });

    await expect(fs.readFile(path.join(destinationFolderPath, 'version'), 'utf8')).resolves.toBe('new');
    await expect(fs.readFile(path.join(backupFolderPath, 'version'), 'utf8')).resolves.toBe('old');
  });
});
