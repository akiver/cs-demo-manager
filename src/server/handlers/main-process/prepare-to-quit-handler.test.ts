import { describe, expect, it, vi } from 'vite-plus/test';
import { prepareToQuitHandler } from './prepare-to-quit-handler';

const mocks = vi.hoisted(() => {
  return {
    destroyDatabaseConnection: vi.fn(),
    stopEmbeddedCluster: vi.fn(),
    stopBackgroundTasks: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/node/database/database', () => {
  return { destroyDatabaseConnection: mocks.destroyDatabaseConnection };
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

    expect(mocks.stopBackgroundTasks).toHaveBeenCalledOnce();
    expect(mocks.destroyDatabaseConnection).toHaveBeenCalledWith({
      stopEmbeddedIfUnused: false,
      releasePendingEmbeddedWithoutStopping: true,
    });
    expect(mocks.stopEmbeddedCluster).toHaveBeenCalledOnce();
    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
