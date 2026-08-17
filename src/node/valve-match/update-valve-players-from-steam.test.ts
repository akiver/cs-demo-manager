import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { updateValvePlayersFromSteam } from './update-valve-players-from-steam';

const mocks = vi.hoisted(() => {
  return {
    buildSteamAccountsFromSteamIds: vi.fn(),
    fetchSteamAccounts: vi.fn(),
    insertSteamAccounts: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/node/database/steam-accounts/build-steam-accounts-from-steam-ids', () => {
  return { buildSteamAccountsFromSteamIds: mocks.buildSteamAccountsFromSteamIds };
});
vi.mock('csdm/node/database/steam-accounts/fetch-steam-accounts', () => {
  return { fetchSteamAccounts: mocks.fetchSteamAccounts };
});
vi.mock('csdm/node/database/steam-accounts/insert-steam-accounts', () => {
  return { insertSteamAccounts: mocks.insertSteamAccounts };
});

beforeEach(() => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
  vi.mocked(logger.error).mockReset();
});

describe('updateValvePlayersFromSteam', () => {
  it('does not log or insert accounts when cancellation wins after the Steam request', async () => {
    const controller = new AbortController();
    const abortReason = new Error('shutdown');
    abortReason.name = 'AbortError';
    mocks.fetchSteamAccounts.mockResolvedValue([]);
    mocks.buildSteamAccountsFromSteamIds.mockImplementationOnce((_steamIds: string[], signal: AbortSignal) => {
      expect(signal).toBe(controller.signal);
      controller.abort(abortReason);
      return Promise.resolve([{ steam_id: '76561198000000000', name: 'Player', avatar: 'avatar' }]);
    });

    const result = updateValvePlayersFromSteam(
      [{ steamId: '76561198000000000' }] as Parameters<typeof updateValvePlayersFromSteam>[0],
      controller.signal,
    );

    await expect(result).rejects.toBe(abortReason);
    expect(mocks.insertSteamAccounts).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
