import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { startBackgroundTasks, stopBackgroundTasks } from './start-background-tasks';

const mocks = vi.hoisted(() => {
  return {
    downloadLastMatchesIfNecessary: vi.fn(),
    checkForNewBannedSteamAccounts: vi.fn(),
    listenForCounterStrikeClosed: vi.fn(),
    stopListeningForCounterStrikeClosed: vi.fn(),
  };
});

vi.stubGlobal('logger', { log: vi.fn(), warn: vi.fn(), error: vi.fn() });
vi.mock('csdm/server/tasks/download-last-matches-if-necessary', () => {
  return { downloadLastMatchesIfNecessary: mocks.downloadLastMatchesIfNecessary };
});
vi.mock('./tasks/check-for-new-banned-steam-accounts', () => {
  return { checkForNewBannedSteamAccounts: mocks.checkForNewBannedSteamAccounts };
});
vi.mock('./tasks/listen-for-counter-strike-closed', () => {
  return {
    listenForCounterStrikeClosed: mocks.listenForCounterStrikeClosed,
    stopListeningForCounterStrikeClosed: mocks.stopListeningForCounterStrikeClosed,
  };
});

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

beforeEach(async () => {
  await stopBackgroundTasks();
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }
  mocks.stopListeningForCounterStrikeClosed.mockResolvedValue(undefined);
  mocks.downloadLastMatchesIfNecessary.mockResolvedValue(undefined);
  mocks.checkForNewBannedSteamAccounts.mockResolvedValue(undefined);
});

afterEach(async () => {
  await stopBackgroundTasks();
  vi.restoreAllMocks();
});

describe('background task lifecycle', () => {
  it('waits for an in-flight task and prevents an old start from scheduling timers after stop', async () => {
    const pendingCheck = deferred<void>();
    const intervalSpy = vi.spyOn(globalThis, 'setInterval');
    mocks.checkForNewBannedSteamAccounts.mockReturnValue(pendingCheck.promise);

    const pendingStart = startBackgroundTasks();
    await vi.waitFor(() => expect(mocks.checkForNewBannedSteamAccounts).toHaveBeenCalledOnce());

    let stopped = false;
    const pendingStop = stopBackgroundTasks().then(() => {
      stopped = true;
    });
    await Promise.resolve();
    expect(stopped).toBe(false);

    pendingCheck.resolve();
    await Promise.all([pendingStart, pendingStop]);

    expect(intervalSpy).not.toHaveBeenCalled();
  });

  it('can start again after an initial task rejects', async () => {
    const error = new Error('download failed');
    mocks.downloadLastMatchesIfNecessary.mockRejectedValueOnce(error);

    await expect(startBackgroundTasks()).rejects.toBe(error);

    await expect(startBackgroundTasks()).resolves.toBeUndefined();
    expect(mocks.listenForCounterStrikeClosed).toHaveBeenCalledTimes(2);
  });

  it('preserves the startup failure when listener cleanup also rejects', async () => {
    const startupError = new Error('download failed');
    mocks.downloadLastMatchesIfNecessary.mockRejectedValueOnce(startupError);
    mocks.stopListeningForCounterStrikeClosed.mockRejectedValueOnce(new Error('listener cleanup failed'));

    await expect(startBackgroundTasks()).rejects.toBe(startupError);
    await expect(startBackgroundTasks()).resolves.toBeUndefined();
  });
});
