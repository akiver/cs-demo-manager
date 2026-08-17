import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { listenForCounterStrikeClosed, stopListeningForCounterStrikeClosed } from './listen-for-counter-strike-closed';

const mocks = vi.hoisted(() => {
  return {
    isCounterStrikeRunning: vi.fn(),
    getSettings: vi.fn(),
    downloadLastValveMatches: vi.fn(),
    downloadLastFaceitMatches: vi.fn(),
    downloadLast5EPlayMatches: vi.fn(),
    downloadLastRenownMatches: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/server/server', () => {
  return { server: { sendMessageToMainProcess: vi.fn() } };
});
vi.mock('csdm/node/counter-strike/is-counter-strike-running', () => {
  return { isCounterStrikeRunning: mocks.isCounterStrikeRunning };
});
vi.mock('csdm/node/settings/get-settings', () => {
  return { getSettings: mocks.getSettings };
});
vi.mock('./download-last-valve-matches', () => {
  return { downloadLastValveMatches: mocks.downloadLastValveMatches };
});
vi.mock('csdm/node/faceit/download-last-faceit-matches', () => {
  return { downloadLastFaceitMatches: mocks.downloadLastFaceitMatches };
});
vi.mock('csdm/node/5eplay/download-last-5eplay-matches', () => {
  return { downloadLast5EPlayMatches: mocks.downloadLast5EPlayMatches };
});
vi.mock('csdm/node/renown/download-last-renown-matches', () => {
  return { downloadLastRenownMatches: mocks.downloadLastRenownMatches };
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

beforeEach(async () => {
  await stopListeningForCounterStrikeClosed();
  vi.useFakeTimers();
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
});

afterEach(async () => {
  await stopListeningForCounterStrikeClosed();
  vi.useRealTimers();
});

describe('Counter-Strike closed listener lifecycle', () => {
  it('does not let an old in-flight check schedule a timer after restart', async () => {
    const oldCheck = deferred<boolean>();
    mocks.isCounterStrikeRunning.mockReturnValueOnce(oldCheck.promise).mockResolvedValue(false);

    listenForCounterStrikeClosed();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(mocks.isCounterStrikeRunning).toHaveBeenCalledOnce();

    const pendingStop = stopListeningForCounterStrikeClosed();
    listenForCounterStrikeClosed();
    expect(vi.getTimerCount()).toBe(1);

    oldCheck.resolve(false);
    await pendingStop;
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(1);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(mocks.isCounterStrikeRunning).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(1);
  });
});
