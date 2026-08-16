import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterAll, describe, expect, it } from 'vite-plus/test';
import { readPostmasterPid } from './read-postmaster-pid';

const dataFolderPath = path.join(os.tmpdir(), 'csdm-postmaster-pid-test');

async function writePostmasterPid(content: string) {
  await fs.ensureDir(dataFolderPath);
  await fs.writeFile(path.join(dataFolderPath, 'postmaster.pid'), content);
}

afterAll(async () => {
  await fs.remove(dataFolderPath);
});

describe('readPostmasterPid', () => {
  it('should return undefined when the file does not exist', async () => {
    await expect(readPostmasterPid(path.join(os.tmpdir(), 'csdm-does-not-exist'))).resolves.toBeUndefined();
  });

  it('should read the PID, the data folder and the port', async () => {
    // Format of the file written by the postmaster, see src/include/utils/pidfile.h
    await writePostmasterPid(
      `12345\nC:\\Users\\csdm\\pgdata\n1751490000\n51863\n\n127.0.0.1\n  5432001         0\nready   \n`,
    );

    await expect(readPostmasterPid(dataFolderPath)).resolves.toEqual({
      pid: 12345,
      dataFolderPath: 'C:\\Users\\csdm\\pgdata',
      port: 51863,
    });
  });

  it('should return undefined when the file is truncated', async () => {
    await writePostmasterPid('12345\nC:\\Users\\csdm\\pgdata\n');

    await expect(readPostmasterPid(dataFolderPath)).resolves.toBeUndefined();
  });

  it('should return undefined when the port is not a number', async () => {
    await writePostmasterPid(`12345\nC:\\Users\\csdm\\pgdata\n1751490000\nnot-a-port\n`);

    await expect(readPostmasterPid(dataFolderPath)).resolves.toBeUndefined();
  });
});
