import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { startEmbeddedCluster } from './start-cluster';
import { ErrorCode } from 'csdm/common/error-code';

const mocks = vi.hoisted(() => {
  return {
    ensureBinaries: vi.fn(),
    findRunningCluster: vi.fn(),
    readState: vi.fn(),
    writeState: vi.fn(),
    resolvePort: vi.fn(),
    isPortInUse: vi.fn(),
    assertVersion: vi.fn(),
    initialize: vi.fn(),
    isInitialized: vi.fn(),
    writeConfig: vi.fn(),
    startServer: vi.fn(),
    validateCluster: vi.fn(),
    releaseUsage: vi.fn(),
  };
});

const clusterFolderPath = path.join(os.tmpdir(), 'csdm-start-cluster-test');

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });

vi.mock('./embedded-postgres-paths', () => {
  return {
    getClusterDataFolderPath: () => path.join(clusterFolderPath, 'pgdata'),
    getClusterFolderPath: () => clusterFolderPath,
    getClusterLogFilePath: () => path.join(clusterFolderPath, 'postgres.log'),
  };
});
vi.mock('./postgres-binaries', () => {
  return { ensurePostgresBinariesExist: mocks.ensureBinaries };
});
vi.mock('./read-postmaster-pid', () => {
  return { findRunningCluster: mocks.findRunningCluster };
});
vi.mock('./cluster-state', () => {
  return { readOrCreateClusterState: mocks.readState, writeClusterState: mocks.writeState };
});
vi.mock('./resolve-cluster-port', () => {
  return { resolveClusterPort: mocks.resolvePort, isPortInUse: mocks.isPortInUse };
});
vi.mock('./initialize-cluster', () => {
  return {
    CLUSTER_DATABASE: 'csdm',
    CLUSTER_USERNAME: 'csdm',
    assertClusterVersionMatchesBinaries: mocks.assertVersion,
    initializeClusterIfNeeded: mocks.initialize,
    isClusterInitialized: mocks.isInitialized,
  };
});
vi.mock('./write-cluster-config', () => {
  return { writeClusterConfig: mocks.writeConfig };
});
vi.mock('./start-postgres-server', () => {
  return { startPostgresServer: mocks.startServer };
});
vi.mock('./validate-running-cluster', () => {
  return { isExpectedRunningCluster: mocks.validateCluster };
});
vi.mock('./cluster-lock', () => {
  return {
    acquireClusterUsageLease: () => {
      return Promise.resolve({ release: mocks.releaseUsage });
    },
    withClusterLock: (callback: () => Promise<unknown>) => callback(),
  };
});

beforeEach(async () => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
  mocks.findRunningCluster.mockResolvedValue(undefined);
  mocks.readState.mockResolvedValue({ password: 'secret' });
  mocks.isInitialized.mockResolvedValue(false);
  mocks.isPortInUse.mockResolvedValue(true);
  await fs.remove(clusterFolderPath);
});

describe('startEmbeddedCluster port retries', () => {
  it('wraps configuration failures in the structured startup error', async () => {
    const error = new Error('access denied');
    mocks.resolvePort.mockResolvedValue(51_000);
    mocks.writeConfig.mockRejectedValue(error);

    await expect(startEmbeddedCluster()).rejects.toMatchObject({
      code: ErrorCode.EmbeddedPostgresStartFailed,
      message: 'Failed to start the built-in database: access denied',
      cause: error,
    });
    expect(mocks.releaseUsage).toHaveBeenCalledOnce();
  });

  it('should retry with another port when the selected one is taken before pg_ctl starts', async () => {
    mocks.resolvePort.mockResolvedValueOnce(51_000).mockResolvedValueOnce(51_001);
    mocks.startServer.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    const session = await startEmbeddedCluster();

    expect(mocks.writeConfig.mock.calls).toEqual([[51_000], [51_001]]);
    expect(mocks.writeState).toHaveBeenCalledWith({ password: 'secret', port: 51_001 });
    expect(session.settings.port).toBe(51_001);
  });

  it('should reuse a verified postmaster that became ready after pg_ctl timed out', async () => {
    const runningCluster = {
      pid: 123,
      port: 51_000,
      dataFolderPath: path.join(clusterFolderPath, 'pgdata'),
    };
    mocks.resolvePort.mockResolvedValue(51_000);
    mocks.startServer.mockResolvedValue(1);
    mocks.findRunningCluster.mockResolvedValueOnce(undefined).mockResolvedValueOnce(runningCluster);
    mocks.validateCluster.mockResolvedValue(true);

    const session = await startEmbeddedCluster();

    expect(mocks.startServer).toHaveBeenCalledOnce();
    expect(mocks.resolvePort).toHaveBeenCalledOnce();
    expect(session.settings.port).toBe(51_000);
  });
});
