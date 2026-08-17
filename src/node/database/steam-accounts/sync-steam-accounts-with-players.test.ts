import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { syncSteamAccountsWithPlayers } from './sync-steam-accounts-with-players';

const mocks = vi.hoisted(() => {
  const query = {
    distinct: vi.fn(),
    execute: vi.fn(),
    select: vi.fn(),
    where: vi.fn(),
  };
  query.distinct.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.where.mockReturnValue(query);

  return {
    buildSteamAccountsFromSteamIds: vi.fn(),
    insertSteamAccounts: vi.fn(),
    query,
    selectFrom: vi.fn(() => query),
  };
});

vi.mock('../database', () => {
  return { db: { selectFrom: mocks.selectFrom } };
});
vi.mock('./build-steam-accounts-from-steam-ids', () => {
  return { buildSteamAccountsFromSteamIds: mocks.buildSteamAccountsFromSteamIds };
});
vi.mock('./insert-steam-accounts', () => {
  return { insertSteamAccounts: mocks.insertSteamAccounts };
});

beforeEach(() => {
  mocks.buildSteamAccountsFromSteamIds.mockReset();
  mocks.insertSteamAccounts.mockReset();
  mocks.query.execute.mockReset();
  mocks.query.execute.mockResolvedValue([{ steam_id: '76561198000000000' }]);
});

describe('syncSteamAccountsWithPlayers', () => {
  it('propagates cancellation to Steam requests and does not insert their result', async () => {
    const controller = new AbortController();
    const abortReason = new Error('shutdown');
    abortReason.name = 'AbortError';
    mocks.buildSteamAccountsFromSteamIds.mockImplementationOnce((_steamIds: string[], signal: AbortSignal) => {
      expect(signal).toBe(controller.signal);
      controller.abort(abortReason);
      return Promise.resolve([{ steam_id: '76561198000000000' }]);
    });

    await expect(syncSteamAccountsWithPlayers(controller.signal)).rejects.toBe(abortReason);

    expect(mocks.insertSteamAccounts).not.toHaveBeenCalled();
  });
});
