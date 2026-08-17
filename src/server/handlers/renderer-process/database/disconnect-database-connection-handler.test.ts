import { ErrorCode } from 'csdm/common/error-code';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { disconnectDatabaseConnectionHandler } from './disconnect-database-connection-handler';

const mocks = vi.hoisted(() => {
  return {
    tryBeginTransition: vi.fn(),
    destroyConnection: vi.fn(),
    updateSettings: vi.fn(),
    connectDatabase: vi.fn(),
    stopBackgroundTasks: vi.fn(),
  };
});

const previousSettings = {
  database: {
    mode: 'embedded' as const,
    hostname: '127.0.0.1',
    port: 5432,
    username: 'csdm',
    password: 'password',
    database: 'csdm',
  },
};

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/server/analyses-listener', () => {
  return { analysesListener: { tryBeginDatabaseTransition: mocks.tryBeginTransition } };
});
vi.mock('csdm/node/database/database', () => {
  return { destroyDatabaseConnection: mocks.destroyConnection };
});
vi.mock('csdm/node/settings/get-settings', () => {
  return { getSettings: () => Promise.resolve(previousSettings) };
});
vi.mock('csdm/node/settings/update-settings', () => {
  return { updateSettings: mocks.updateSettings };
});
vi.mock('csdm/node/database/connect-database', () => {
  return { connectDatabase: mocks.connectDatabase };
});
vi.mock('csdm/server/start-background-tasks', () => {
  return { stopBackgroundTasks: mocks.stopBackgroundTasks };
});

beforeEach(() => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
});

describe('disconnectDatabaseConnectionHandler', () => {
  it('should refuse mode switching while a demo analysis is active', async () => {
    mocks.tryBeginTransition.mockReturnValue(undefined);

    await expect(disconnectDatabaseConnectionHandler({ nextMode: 'external' })).resolves.toEqual({
      error: {
        code: ErrorCode.DatabaseTransitionInProgress,
        message: 'The database cannot be changed while demo analyses are in progress.',
      },
    });
    expect(mocks.destroyConnection).not.toHaveBeenCalled();
    expect(mocks.updateSettings).not.toHaveBeenCalled();
  });

  it('should persist external mode only after the embedded connection was released', async () => {
    const releaseTransition = vi.fn();
    const nextSettings = { ...previousSettings, database: { ...previousSettings.database, mode: 'external' } };
    mocks.tryBeginTransition.mockReturnValue(releaseTransition);
    mocks.updateSettings.mockResolvedValue(nextSettings);

    await expect(disconnectDatabaseConnectionHandler({ nextMode: 'external' })).resolves.toEqual({
      settings: nextSettings,
    });

    expect(mocks.destroyConnection).toHaveBeenCalledWith({ stopEmbeddedIfUnused: true });
    expect(mocks.destroyConnection.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.updateSettings.mock.invocationCallOrder[0],
    );
    expect(releaseTransition).toHaveBeenCalledOnce();
  });
});
