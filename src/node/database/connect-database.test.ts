import type { PreparedDatabaseConnection } from 'csdm/node/database/database';
import type { DatabaseSettings, Settings } from 'csdm/node/settings/settings';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { connectDatabaseAndPersist } from './connect-database';

const { commitMock, discardMock, prepareMock, updateSettingsMock } = vi.hoisted(() => {
  return {
    commitMock: vi.fn(),
    discardMock: vi.fn(),
    prepareMock: vi.fn(),
    updateSettingsMock: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/node/database/database', () => {
  return {
    commitDatabaseConnection: commitMock,
    discardPreparedDatabaseConnection: discardMock,
  };
});
vi.mock('csdm/node/database/open-database', () => {
  return {
    openDatabase: vi.fn(),
    prepareDatabaseConnection: prepareMock,
  };
});
vi.mock('csdm/node/settings/update-settings', () => {
  return { updateSettings: updateSettingsMock };
});
vi.mock('csdm/server/start-background-tasks', () => {
  return { startBackgroundTasks: vi.fn() };
});

const databaseSettings: DatabaseSettings = {
  mode: 'external',
  hostname: 'localhost',
  port: 5432,
  username: 'csdm',
  password: 'password',
  database: 'csdm',
};
const preparedConnection = { settings: databaseSettings } as PreparedDatabaseConnection;
const settings = { database: databaseSettings } as Settings;

beforeEach(() => {
  commitMock.mockReset();
  discardMock.mockReset();
  prepareMock.mockReset();
  updateSettingsMock.mockReset();
  prepareMock.mockResolvedValue(preparedConnection);
  updateSettingsMock.mockResolvedValue(settings);
});

describe('connectDatabaseAndPersist', () => {
  it('should publish a connection only after its settings were persisted', async () => {
    await expect(connectDatabaseAndPersist(databaseSettings)).resolves.toBe(settings);

    expect(updateSettingsMock).toHaveBeenCalledWith({ database: databaseSettings });
    expect(commitMock).toHaveBeenCalledWith(preparedConnection, { stopPreviousEmbeddedIfUnused: true });
    expect(updateSettingsMock.mock.invocationCallOrder[0]).toBeLessThan(commitMock.mock.invocationCallOrder[0]);
    expect(discardMock).not.toHaveBeenCalled();
  });

  it('should discard the candidate and keep the current connection when settings persistence fails', async () => {
    const error = new Error('read-only settings folder');
    updateSettingsMock.mockRejectedValueOnce(error);

    await expect(connectDatabaseAndPersist(databaseSettings)).rejects.toBe(error);

    expect(discardMock).toHaveBeenCalledWith(preparedConnection);
    expect(commitMock).not.toHaveBeenCalled();
  });

  it('should preserve the settings error when discarding the candidate also fails', async () => {
    const settingsError = new Error('read-only settings folder');
    updateSettingsMock.mockRejectedValueOnce(settingsError);
    discardMock.mockRejectedValueOnce(new Error('candidate cleanup failed'));

    await expect(connectDatabaseAndPersist(databaseSettings)).rejects.toBe(settingsError);

    expect(commitMock).not.toHaveBeenCalled();
  });

  it('should keep the current connection when candidate preparation or migration fails', async () => {
    const error = new Error('migration failed');
    prepareMock.mockRejectedValueOnce(error);

    await expect(connectDatabaseAndPersist(databaseSettings)).rejects.toBe(error);

    expect(updateSettingsMock).not.toHaveBeenCalled();
    expect(discardMock).not.toHaveBeenCalled();
    expect(commitMock).not.toHaveBeenCalled();
  });
});
