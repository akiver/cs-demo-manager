import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import type { EmbeddedClusterSession } from './embedded/start-cluster';

let databaseModule: typeof import('./database');

const mocks = vi.hoisted(() => {
  return { destroyDatabase: vi.fn(), releaseEmbeddedClusterSession: vi.fn() };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('pg', () => {
  return {
    types: {
      builtins: { INT8: 20, NUMERIC: 1700, INT4: 23, INT2: 21 },
      setTypeParser: vi.fn(),
    },
    Pool: class Pool {
      public end() {
        return Promise.resolve();
      }
    },
  };
});
vi.mock('kysely', () => {
  return {
    PostgresDialect: class PostgresDialect {},
    Kysely: class Kysely {
      public destroy = mocks.destroyDatabase;
    },
  };
});
vi.mock('csdm/node/database/embedded/stop-cluster', () => {
  return { releaseEmbeddedClusterSession: mocks.releaseEmbeddedClusterSession };
});

beforeEach(async () => {
  vi.resetModules();
  mocks.destroyDatabase.mockReset().mockResolvedValue(undefined);
  mocks.releaseEmbeddedClusterSession.mockReset();
  databaseModule = await import('./database');
});

describe('embedded session cleanup', () => {
  it('retains and retries a session whose usage lease could not be released', async () => {
    const releaseError = new Error('unlock failed');
    mocks.releaseEmbeddedClusterSession.mockRejectedValueOnce(releaseError).mockResolvedValueOnce(undefined);
    const settings = {
      mode: 'embedded' as const,
      hostname: '127.0.0.1',
      port: 54_321,
      username: 'csdm',
      password: 'secret',
      database: 'csdm',
    };
    const session = {
      settings,
      usageLease: { release: vi.fn() },
    } as EmbeddedClusterSession;
    const connection = databaseModule.createDatabaseConnection(settings, session);
    await databaseModule.commitDatabaseConnection(connection, { stopPreviousEmbeddedIfUnused: false });

    await expect(databaseModule.destroyDatabaseConnection({ stopEmbeddedIfUnused: true })).rejects.toBe(releaseError);
    await expect(databaseModule.destroyDatabaseConnection()).resolves.toBeUndefined();

    expect(mocks.releaseEmbeddedClusterSession).toHaveBeenCalledTimes(2);
    expect(mocks.releaseEmbeddedClusterSession).toHaveBeenLastCalledWith(session, { stopIfUnused: true });
  });

  it('releases every queued session without stopping before the single final shutdown stop', async () => {
    const releaseError = new Error('unlock failed');
    mocks.releaseEmbeddedClusterSession.mockRejectedValueOnce(releaseError).mockResolvedValueOnce(undefined);
    const settings = {
      mode: 'embedded' as const,
      hostname: '127.0.0.1',
      port: 54_321,
      username: 'csdm',
      password: 'secret',
      database: 'csdm',
    };
    const session = {
      settings,
      usageLease: { release: vi.fn() },
    } as EmbeddedClusterSession;
    const connection = databaseModule.createDatabaseConnection(settings, session);
    await databaseModule.commitDatabaseConnection(connection, { stopPreviousEmbeddedIfUnused: false });

    await expect(databaseModule.destroyDatabaseConnection({ stopEmbeddedIfUnused: true })).rejects.toBe(releaseError);
    await expect(
      databaseModule.destroyDatabaseConnection({ releasePendingEmbeddedWithoutStopping: true }),
    ).resolves.toBeUndefined();

    expect(mocks.releaseEmbeddedClusterSession).toHaveBeenLastCalledWith(session, { stopIfUnused: false });
  });

  it('preserves a resource cleanup rejection until the deferred shutdown phase observes it', async () => {
    const destroyError = new Error('pool destroy failed');
    const settings = {
      mode: 'external' as const,
      hostname: '127.0.0.1',
      port: 54_321,
      username: 'csdm',
      password: 'secret',
      database: 'csdm',
    };
    const connection = databaseModule.createDatabaseConnection(settings);
    await databaseModule.commitDatabaseConnection(connection, { stopPreviousEmbeddedIfUnused: false });
    mocks.destroyDatabase.mockRejectedValueOnce(destroyError);

    const cleanup = databaseModule.beginDatabaseConnectionCleanup();
    await Promise.resolve();

    await expect(cleanup.resourcesDestroyed).rejects.toBe(destroyError);
  });
});
