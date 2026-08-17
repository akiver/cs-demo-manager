import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import type { Download } from 'csdm/common/download/download-types';
import { downloadDemoQueue } from './download-queue';

const mocks = vi.hoisted(() => {
  return {
    assertDownloadFolderIsValid: vi.fn(),
    getSettings: vi.fn(),
    isDownloadLinkExpired: vi.fn(),
    sendMessageToRendererProcess: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/node/download/assert-download-folder-is-valid', () => {
  return { assertDownloadFolderIsValid: mocks.assertDownloadFolderIsValid };
});
vi.mock('csdm/node/settings/get-settings', () => {
  return { getSettings: mocks.getSettings };
});
vi.mock('csdm/node/download/is-download-link-expired', () => {
  return { isDownloadLinkExpired: mocks.isDownloadLinkExpired };
});
vi.mock('csdm/server/server', () => {
  return { server: { sendMessageToRendererProcess: mocks.sendMessageToRendererProcess } };
});

afterEach(() => {
  downloadDemoQueue.abortDownloads();
  vi.clearAllMocks();
});

describe('downloadDemoQueue.addDownloads', () => {
  it('does not commit downloads when cancellation wins during validation', async () => {
    const controller = new AbortController();
    const abortReason = new Error('shutdown');
    abortReason.name = 'AbortError';
    mocks.getSettings.mockResolvedValue({ download: { folderPath: 'missing-download-folder' } });
    mocks.isDownloadLinkExpired.mockImplementationOnce((_url: string, signal: AbortSignal) => {
      controller.abort(abortReason);
      expect(signal).toBe(controller.signal);
      return Promise.resolve(false);
    });
    const download = {
      source: 'renown',
      game: 'cs2',
      matchId: 'match-id',
      fileName: 'match-file',
      demoUrl: 'https://example.com/demo.zip',
      match: {},
    } as unknown as Download;

    await expect(downloadDemoQueue.addDownloads([download], controller.signal)).rejects.toBe(abortReason);

    expect(downloadDemoQueue.getDownloads()).toEqual([]);
    expect(mocks.sendMessageToRendererProcess).not.toHaveBeenCalled();
  });
});
