import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { fetchLastRenownMatches } from './fetch-last-renown-matches';

const mocks = vi.hoisted(() => {
  return {
    assertValidRenownResponse: vi.fn(),
    fetch: vi.fn(),
    getSettings: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.stubGlobal('fetch', mocks.fetch);
vi.mock('csdm/node/settings/get-settings', () => {
  return { getSettings: mocks.getSettings };
});
vi.mock('./assert-valid-renown-response', () => {
  return { assertValidRenownResponse: mocks.assertValidRenownResponse };
});

beforeEach(() => {
  mocks.fetch.mockReset();
  mocks.getSettings.mockReset();
  mocks.assertValidRenownResponse.mockReset();
  vi.mocked(logger.log).mockReset();
});

describe('fetchLastRenownMatches', () => {
  it('does not log an aborted match request as not found', async () => {
    const controller = new AbortController();
    const abortReason = new Error('shutdown');
    abortReason.name = 'AbortError';
    mocks.fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve({ data: [{ match_id: 123 }] }) })
      .mockImplementationOnce((_url: string, options: { signal: AbortSignal }) => {
        expect(options.signal).toBe(controller.signal);
        controller.abort(abortReason);
        return Promise.reject(abortReason);
      });
    mocks.getSettings.mockResolvedValue({ download: { folderPath: 'downloads' } });

    await expect(fetchLastRenownMatches('76561198000000000', controller.signal)).rejects.toBe(abortReason);

    expect(logger.log).not.toHaveBeenCalled();
  });
});
