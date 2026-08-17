import { ErrorCode } from 'csdm/common/error-code';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { connectDatabaseHandler } from './connect-database-handler';

const mocks = vi.hoisted(() => {
  return {
    tryBeginTransition: vi.fn(),
    connectDatabase: vi.fn(),
    connectDatabaseAndPersist: vi.fn(),
    getSettings: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/server/analyses-listener', () => {
  return { analysesListener: { tryBeginDatabaseTransition: mocks.tryBeginTransition } };
});
vi.mock('csdm/node/database/connect-database', () => {
  return {
    connectDatabase: mocks.connectDatabase,
    connectDatabaseAndPersist: mocks.connectDatabaseAndPersist,
  };
});
vi.mock('csdm/node/settings/get-settings', () => {
  return { getSettings: mocks.getSettings };
});

beforeEach(() => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
});

describe('connectDatabaseHandler', () => {
  it('should refuse an explicit database connection while a demo analysis is active', async () => {
    mocks.tryBeginTransition.mockReturnValue(undefined);

    await expect(
      connectDatabaseHandler({
        mode: 'external',
        hostname: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'csdm',
      }),
    ).resolves.toEqual({
      error: {
        code: ErrorCode.DatabaseTransitionInProgress,
        message: 'The database cannot be changed while demo analyses are in progress.',
      },
    });
    expect(mocks.connectDatabaseAndPersist).not.toHaveBeenCalled();
  });

  it('should hold the transition gate until the candidate connection is committed', async () => {
    const releaseTransition = vi.fn();
    const databaseSettings = {
      mode: 'external' as const,
      hostname: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'csdm',
    };
    const settings = { database: databaseSettings };
    mocks.tryBeginTransition.mockReturnValue(releaseTransition);
    mocks.connectDatabaseAndPersist.mockResolvedValue(settings);

    await expect(connectDatabaseHandler(databaseSettings)).resolves.toEqual({ settings });
    expect(releaseTransition).toHaveBeenCalledOnce();
    expect(mocks.connectDatabaseAndPersist.mock.invocationCallOrder[0]).toBeLessThan(
      releaseTransition.mock.invocationCallOrder[0],
    );
  });

  it('should acquire the transition gate for auto-connect', async () => {
    const releaseTransition = vi.fn();
    const settings = { database: { mode: 'embedded' as const } };
    mocks.tryBeginTransition.mockReturnValue(releaseTransition);
    mocks.connectDatabase.mockResolvedValue(undefined);
    mocks.getSettings.mockResolvedValue(settings);

    await expect(connectDatabaseHandler(undefined)).resolves.toEqual({ settings });

    expect(mocks.connectDatabase).toHaveBeenCalledOnce();
    expect(releaseTransition).toHaveBeenCalledOnce();
    expect(mocks.getSettings.mock.invocationCallOrder[0]).toBeLessThan(releaseTransition.mock.invocationCallOrder[0]);
  });

  it('should refuse auto-connect while another database transition is active', async () => {
    mocks.tryBeginTransition.mockReturnValue(undefined);

    await expect(connectDatabaseHandler(undefined)).resolves.toEqual({
      error: {
        code: ErrorCode.DatabaseTransitionInProgress,
        message: 'The database cannot be changed while demo analyses are in progress.',
      },
    });

    expect(mocks.connectDatabase).not.toHaveBeenCalled();
  });
});
