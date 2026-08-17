import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

let prepareToQuitHandler: typeof import('./prepare-to-quit-handler').prepareToQuitHandler;

const mocks = vi.hoisted(() => {
  return {
    beginDatabaseConnectionCleanup: vi.fn(),
    stopEmbeddedCluster: vi.fn(),
    stopBackgroundTasks: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/node/database/database', () => {
  return { beginDatabaseConnectionCleanup: mocks.beginDatabaseConnectionCleanup };
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
  mocks.stopBackgroundTasks.mockResolvedValue('drained');
  mocks.stopEmbeddedCluster.mockResolvedValue(true);
  mocks.beginDatabaseConnectionCleanup.mockReturnValue({
    embeddedValidationPassword: 'secret',
    embeddedSessionsReleased: Promise.resolve(),
    resourcesDestroyed: Promise.resolve(),
  });
  ({ prepareToQuitHandler } = await import('./prepare-to-quit-handler'));
});
vi.mock('csdm/node/database/embedded/stop-cluster', () => {
  return { stopEmbeddedCluster: mocks.stopEmbeddedCluster };
});
vi.mock('csdm/server/start-background-tasks', () => {
  return { stopBackgroundTasks: mocks.stopBackgroundTasks };
});

describe('prepareToQuitHandler', () => {
  it('releases the session without stopping and resolves even when the final lifecycle lock fails', async () => {
    const error = new Error('lifecycle lock failed');
    mocks.stopEmbeddedCluster.mockRejectedValue(error);

    await expect(prepareToQuitHandler()).resolves.toBeUndefined();

    expect(mocks.stopBackgroundTasks).toHaveBeenCalledWith({
      abortAfterMs: 30_000,
      abortSettleTimeoutMs: 5_000,
    });
    expect(mocks.beginDatabaseConnectionCleanup).toHaveBeenCalledWith({
      stopEmbeddedIfUnused: false,
      releasePendingEmbeddedWithoutStopping: true,
    });
    expect(mocks.stopEmbeddedCluster).toHaveBeenCalledOnce();
    expect(mocks.stopEmbeddedCluster).toHaveBeenCalledWith({ validationPassword: 'secret' });
    expect(logger.error).toHaveBeenCalledWith(error);
  });

  it('releases the embedded lease and stops PostgreSQL without waiting for residual pool cleanup', async () => {
    const poolCleanup = deferred<void>();
    const embeddedSessionsReleased = vi.fn();
    const sessionRelease = Promise.resolve().then(embeddedSessionsReleased);
    mocks.beginDatabaseConnectionCleanup.mockReturnValue({
      embeddedValidationPassword: 'secret',
      embeddedSessionsReleased: sessionRelease,
      resourcesDestroyed: poolCleanup.promise,
    });

    await expect(prepareToQuitHandler()).resolves.toBeUndefined();

    expect(embeddedSessionsReleased.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.stopEmbeddedCluster.mock.invocationCallOrder[0],
    );
    expect(mocks.stopEmbeddedCluster).toHaveBeenCalledOnce();
    poolCleanup.resolve();
  });

  it('continues shutdown when background work ignores cancellation and preserves a cluster used by a CLI', async () => {
    mocks.stopBackgroundTasks.mockResolvedValue('timed-out');
    mocks.stopEmbeddedCluster.mockResolvedValue(false);

    await expect(prepareToQuitHandler()).resolves.toBeUndefined();

    expect(mocks.stopEmbeddedCluster).toHaveBeenCalledOnce();
    expect(logger.error).toHaveBeenCalledWith('Continuing shutdown after background tasks ignored cancellation');
    expect(logger.log).toHaveBeenCalledWith('The built-in database remains running after application shutdown');
  });

  it('continues to the PostgreSQL stop when background task cleanup rejects', async () => {
    const error = new Error('background cleanup failed');
    mocks.stopBackgroundTasks.mockRejectedValue(error);

    await expect(prepareToQuitHandler()).resolves.toBeUndefined();

    expect(mocks.beginDatabaseConnectionCleanup).toHaveBeenCalledOnce();
    expect(mocks.stopEmbeddedCluster).toHaveBeenCalledOnce();
    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
