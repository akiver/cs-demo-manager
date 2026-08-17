import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { releaseEmbeddedClusterSession, stopEmbeddedClusterWithoutLock } from './stop-cluster';

const mocks = vi.hoisted(() => {
  return {
    findRunningCluster: vi.fn(),
    readClusterState: vi.fn(),
    isExpectedRunningCluster: vi.fn(),
    runPostgresCommand: vi.fn(),
    releaseExclusiveUsage: vi.fn(),
    withClusterLock: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('./embedded-postgres-paths', () => {
  return { getClusterDataFolderPath: () => '/cluster/pgdata' };
});
vi.mock('./postgres-binaries', () => {
  return { getPostgresBinaryPath: () => '/bin/pg_ctl' };
});
vi.mock('./run-postgres-command', () => {
  return { runPostgresCommand: mocks.runPostgresCommand };
});
vi.mock('./read-postmaster-pid', () => {
  return { findRunningCluster: mocks.findRunningCluster };
});
vi.mock('./cluster-state', () => {
  return { readClusterState: mocks.readClusterState };
});
vi.mock('./validate-running-cluster', () => {
  return { isExpectedRunningCluster: mocks.isExpectedRunningCluster };
});
vi.mock('./cluster-lock', () => {
  return {
    CLUSTER_LIFECYCLE_LOCK_TIMEOUT_MS: 180_000,
    tryAcquireExclusiveClusterUsage: () => {
      return Promise.resolve({ release: mocks.releaseExclusiveUsage });
    },
    withClusterLock: mocks.withClusterLock,
  };
});

beforeEach(() => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
  mocks.findRunningCluster.mockResolvedValue({
    pid: 123,
    port: 54_321,
    dataFolderPath: '/cluster/pgdata',
  });
  mocks.isExpectedRunningCluster.mockResolvedValue(true);
  mocks.runPostgresCommand.mockResolvedValue({ stdout: '', stderr: '' });
  mocks.withClusterLock.mockImplementation((callback: () => Promise<unknown>) => callback());
});

describe('embedded cluster stop', () => {
  it('refuses to signal a running cluster when no credential can verify its identity', async () => {
    mocks.readClusterState.mockResolvedValue(undefined);

    await expect(stopEmbeddedClusterWithoutLock()).resolves.toEqual({ status: 'identity-unverifiable' });
    expect(mocks.isExpectedRunningCluster).not.toHaveBeenCalled();
    expect(mocks.runPostgresCommand).not.toHaveBeenCalled();
  });

  it('uses the in-memory session credential when state.json is missing', async () => {
    const releaseUsage = vi.fn();
    const session = {
      settings: {
        mode: 'embedded' as const,
        hostname: '127.0.0.1',
        port: 54_321,
        username: 'csdm',
        password: 'session-secret',
        database: 'csdm',
      },
      usageLease: { release: releaseUsage },
    };

    await releaseEmbeddedClusterSession(session, { stopIfUnused: true });

    expect(releaseUsage).toHaveBeenCalledOnce();
    expect(mocks.readClusterState).not.toHaveBeenCalled();
    expect(mocks.isExpectedRunningCluster).toHaveBeenCalledWith(
      expect.objectContaining({ pid: 123 }),
      '/cluster/pgdata',
      'session-secret',
    );
    expect(mocks.runPostgresCommand).toHaveBeenCalledOnce();
    expect(mocks.releaseExclusiveUsage).toHaveBeenCalledOnce();
  });

  it('releases a session without taking the lifecycle lock when no stop was requested', async () => {
    const releaseUsage = vi.fn();
    const session = {
      settings: {
        mode: 'embedded' as const,
        hostname: '127.0.0.1',
        port: 54_321,
        username: 'csdm',
        password: 'session-secret',
        database: 'csdm',
      },
      usageLease: { release: releaseUsage },
    };

    await releaseEmbeddedClusterSession(session, { stopIfUnused: false });

    expect(releaseUsage).toHaveBeenCalledOnce();
    expect(mocks.withClusterLock).not.toHaveBeenCalled();
    expect(mocks.runPostgresCommand).not.toHaveBeenCalled();
  });

  it('reports pg_ctl failure instead of treating a closed listener as a successful stop', async () => {
    const error = new Error('pg_ctl timed out');
    mocks.readClusterState.mockResolvedValue({ password: 'secret' });
    mocks.runPostgresCommand.mockRejectedValue(error);

    await expect(stopEmbeddedClusterWithoutLock()).resolves.toEqual({ status: 'failed', cause: error });
  });
});
