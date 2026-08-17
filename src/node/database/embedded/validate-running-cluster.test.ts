import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { isExpectedRunningCluster } from './validate-running-cluster';

const { connectMock, endMock, queryMock } = vi.hoisted(() => {
  return { connectMock: vi.fn(), endMock: vi.fn(), queryMock: vi.fn() };
});

vi.mock('pg', () => {
  return {
    Client: class {
      public connect = connectMock;
      public end = endMock;
      public query = queryMock;
    },
  };
});

const rootFolderPath = path.join(os.tmpdir(), 'csdm-running-cluster-identity-test');
const expectedDataFolderPath = path.join(rootFolderPath, 'expected');
const otherDataFolderPath = path.join(rootFolderPath, 'other');
const runningCluster = { pid: 123, port: 54_321, dataFolderPath: expectedDataFolderPath };

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });

beforeEach(async () => {
  connectMock.mockReset();
  endMock.mockReset();
  queryMock.mockReset();
  endMock.mockResolvedValue(undefined);
  await Promise.all([fs.ensureDir(expectedDataFolderPath), fs.ensureDir(otherDataFolderPath)]);
});

afterEach(async () => {
  await fs.remove(rootFolderPath);
});

describe('isExpectedRunningCluster', () => {
  it('should accept the listener reporting the expected canonical data directory', async () => {
    queryMock.mockResolvedValue({ rows: [{ data_directory: expectedDataFolderPath }] });

    await expect(isExpectedRunningCluster(runningCluster, expectedDataFolderPath, 'secret')).resolves.toBe(true);
    expect(queryMock).toHaveBeenCalledWith('SHOW data_directory');
  });

  it('should reject an unrelated PostgreSQL listener on the postmaster port', async () => {
    queryMock.mockResolvedValue({ rows: [{ data_directory: otherDataFolderPath }] });

    await expect(isExpectedRunningCluster(runningCluster, expectedDataFolderPath, 'secret')).resolves.toBe(false);
  });

  it('should reject a listener that cannot be authenticated', async () => {
    connectMock.mockRejectedValue(new Error('authentication failed'));

    await expect(isExpectedRunningCluster(runningCluster, expectedDataFolderPath, 'wrong')).resolves.toBe(false);
  });
});
