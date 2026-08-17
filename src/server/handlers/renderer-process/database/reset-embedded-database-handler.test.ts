import { ErrorCode } from 'csdm/common/error-code';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { resetEmbeddedDatabaseHandler } from './reset-embedded-database-handler';

const mocks = vi.hoisted(() => {
  return {
    tryBeginTransition: vi.fn(),
    destroyConnection: vi.fn(),
    resetCluster: vi.fn(),
    connectDatabase: vi.fn(),
    stopBackgroundTasks: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/server/analyses-listener', () => {
  return { analysesListener: { tryBeginDatabaseTransition: mocks.tryBeginTransition } };
});
vi.mock('csdm/node/database/database', () => {
  return { destroyDatabaseConnection: mocks.destroyConnection };
});
vi.mock('csdm/node/database/embedded/reset-cluster', () => {
  return { resetEmbeddedCluster: mocks.resetCluster };
});
vi.mock('csdm/node/database/connect-database', () => {
  return { connectDatabase: mocks.connectDatabase };
});
vi.mock('csdm/server/start-background-tasks', () => {
  return { stopBackgroundTasks: mocks.stopBackgroundTasks };
});
vi.mock('csdm/node/settings/get-settings', () => {
  return { getSettings: () => Promise.resolve({ database: { mode: 'embedded' } }) };
});

beforeEach(() => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
});

describe('resetEmbeddedDatabaseHandler', () => {
  it('should not disconnect or reset while a demo analysis is active', async () => {
    mocks.tryBeginTransition.mockReturnValue(undefined);

    await expect(resetEmbeddedDatabaseHandler()).resolves.toEqual({
      code: ErrorCode.DatabaseTransitionInProgress,
      message: 'The database cannot be changed while demo analyses are in progress.',
    });
    expect(mocks.destroyConnection).not.toHaveBeenCalled();
    expect(mocks.resetCluster).not.toHaveBeenCalled();
  });

  it('should hold the transition gate until disconnect and reset complete', async () => {
    const releaseTransition = vi.fn();
    mocks.tryBeginTransition.mockReturnValue(releaseTransition);

    await expect(resetEmbeddedDatabaseHandler()).resolves.toBeUndefined();

    expect(mocks.destroyConnection).toHaveBeenCalledOnce();
    expect(mocks.resetCluster).toHaveBeenCalledOnce();
    expect(releaseTransition).toHaveBeenCalledOnce();
  });
});
