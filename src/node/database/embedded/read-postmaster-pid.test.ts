import os from 'node:os';
import net from 'node:net';
import path from 'node:path';
import fs from 'fs-extra';
import { afterAll, describe, expect, it } from 'vite-plus/test';
import { findRunningCluster, isProcessAlive, readPostmasterPid } from './read-postmaster-pid';

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

  it('should return undefined when a value is out of range or only starts with digits', async () => {
    const invalidValues = [
      `0\nC:\\Users\\csdm\\pgdata\n1751490000\n51863\n`,
      `-1\nC:\\Users\\csdm\\pgdata\n1751490000\n51863\n`,
      `12345\nC:\\Users\\csdm\\pgdata\n1751490000\n99999\n`,
      `12345abc\nC:\\Users\\csdm\\pgdata\n1751490000\n51863\n`,
    ];

    for (const content of invalidValues) {
      await writePostmasterPid(content);

      await expect(readPostmasterPid(dataFolderPath)).resolves.toBeUndefined();
    }
  });
});

describe('isProcessAlive', () => {
  // Signal 0 on a non-positive PID targets a process group, on POSIX the caller's own one, a
  // corrupted file holding "0" would report a running cluster.
  it('should return false for a non-positive PID', () => {
    expect(isProcessAlive(0)).toBe(false);
    expect(isProcessAlive(-1)).toBe(false);
    expect(isProcessAlive(Number.NaN)).toBe(false);
  });

  it('should return true for the current process', () => {
    expect(isProcessAlive(process.pid)).toBe(true);
  });
});

describe('findRunningCluster', () => {
  // The operating system reuses PIDs: an unrelated process holding the PID of a crashed postmaster
  // would make the app reuse a cluster that is not running, on every attempt.
  it('should return undefined when nothing listens on the port of a live PID', async () => {
    const server = net.createServer();
    const port = await new Promise<number>((resolve) => {
      server.listen({ port: 0, host: '127.0.0.1' }, () => {
        const address = server.address();
        resolve(typeof address === 'object' && address !== null ? address.port : 0);
      });
    });
    await new Promise((resolve) => server.close(resolve));
    await writePostmasterPid(`${process.pid}\n${dataFolderPath}\n1751490000\n${port}\n`);

    await expect(findRunningCluster(dataFolderPath)).resolves.toBeUndefined();
  });

  it('should return the cluster when its port is listening', async () => {
    const server = net.createServer();
    const port = await new Promise<number>((resolve) => {
      server.listen({ port: 0, host: '127.0.0.1' }, () => {
        const address = server.address();
        resolve(typeof address === 'object' && address !== null ? address.port : 0);
      });
    });
    try {
      await writePostmasterPid(`${process.pid}\n${dataFolderPath}\n1751490000\n${port}\n`);

      await expect(findRunningCluster(dataFolderPath)).resolves.toEqual({
        pid: process.pid,
        dataFolderPath,
        port,
      });
    } finally {
      // A failing assertion would otherwise leave the socket bound and the event loop open.
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('should return undefined when the data folder does not match', async () => {
    await writePostmasterPid(`${process.pid}\nC:\\somewhere\\else\n1751490000\n51863\n`);

    await expect(findRunningCluster(dataFolderPath)).resolves.toBeUndefined();
  });
});
