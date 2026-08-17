import { ErrorCode } from 'csdm/common/error-code';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { resetDatabaseHandler } from './reset-database-handler';

const mocks = vi.hoisted(() => {
  return {
    tryBeginTransition: vi.fn(),
    transactionExecute: vi.fn(),
    resetDatabase: vi.fn(),
    destroyConnection: vi.fn(),
    stopBackgroundTasks: vi.fn(),
    getSettings: vi.fn(),
    connectDatabase: vi.fn(),
  };
});

const previousDatabaseSettings = {
  mode: 'external' as const,
  hostname: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'csdm',
};

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/server/analyses-listener', () => {
  return { analysesListener: { tryBeginDatabaseTransition: mocks.tryBeginTransition } };
});
vi.mock('csdm/node/database/database', () => {
  return {
    db: { transaction: () => ({ execute: mocks.transactionExecute }) },
    destroyDatabaseConnection: mocks.destroyConnection,
  };
});
vi.mock('csdm/node/database/reset-database', () => {
  return { resetDatabase: mocks.resetDatabase };
});
vi.mock('csdm/server/start-background-tasks', () => {
  return { stopBackgroundTasks: mocks.stopBackgroundTasks };
});
vi.mock('csdm/node/settings/get-settings', () => {
  return { getSettings: mocks.getSettings };
});
vi.mock('csdm/node/database/connect-database', () => {
  return { connectDatabase: mocks.connectDatabase };
});

beforeEach(() => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
  mocks.getSettings.mockResolvedValue({ database: previousDatabaseSettings });
  mocks.transactionExecute.mockImplementation((callback) => Promise.resolve(callback({})));
});

describe('resetDatabaseHandler', () => {
  it('quiesces background work before resetting the schema and releases the gate last', async () => {
    const releaseTransition = vi.fn();
    mocks.tryBeginTransition.mockReturnValue(releaseTransition);

    await expect(resetDatabaseHandler()).resolves.toBeUndefined();

    expect(mocks.stopBackgroundTasks.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.resetDatabase.mock.invocationCallOrder[0],
    );
    expect(mocks.resetDatabase.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.destroyConnection.mock.invocationCallOrder[0],
    );
    expect(mocks.destroyConnection.mock.invocationCallOrder[0]).toBeLessThan(
      releaseTransition.mock.invocationCallOrder[0],
    );
  });

  it('restores the previous connection when the reset fails', async () => {
    const releaseTransition = vi.fn();
    const error = new Error('reset failed');
    mocks.tryBeginTransition.mockReturnValue(releaseTransition);
    mocks.resetDatabase.mockRejectedValue(error);

    await expect(resetDatabaseHandler()).resolves.toEqual({
      code: ErrorCode.UnknownError,
      message: error.message,
    });

    expect(mocks.connectDatabase).toHaveBeenCalledWith(previousDatabaseSettings);
    expect(releaseTransition).toHaveBeenCalledOnce();
  });

  it('releases the transition gate when settings cannot be read', async () => {
    const releaseTransition = vi.fn();
    const error = new Error('settings unavailable');
    mocks.tryBeginTransition.mockReturnValue(releaseTransition);
    mocks.getSettings.mockRejectedValue(error);

    await expect(resetDatabaseHandler()).resolves.toEqual({
      code: ErrorCode.UnknownError,
      message: error.message,
    });

    expect(releaseTransition).toHaveBeenCalledOnce();
    expect(mocks.stopBackgroundTasks).not.toHaveBeenCalled();
  });
});
