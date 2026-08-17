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

  it('does not start a new session until the pending stop has drained', async () => {
    const pendingCheck = deferred<void>();
    mocks.checkForNewBannedSteamAccounts.mockReturnValueOnce(pendingCheck.promise);

    const initialStart = startBackgroundTasks();
    await vi.waitFor(() => expect(mocks.checkForNewBannedSteamAccounts).toHaveBeenCalledOnce());

    const pendingStop = stopBackgroundTasks();
    const restart = startBackgroundTasks();
    await Promise.resolve();
    expect(mocks.listenForCounterStrikeClosed).toHaveBeenCalledOnce();

    pendingCheck.resolve();
    await Promise.all([initialStart, pendingStop, restart]);

    expect(mocks.listenForCounterStrikeClosed).toHaveBeenCalledTimes(2);
  });

  it('shares a pending stop between concurrent callers', async () => {
    const pendingListenerStop = deferred<void>();
    await startBackgroundTasks();
    mocks.stopListeningForCounterStrikeClosed.mockReturnValueOnce(pendingListenerStop.promise);

    const firstStop = stopBackgroundTasks();
    const secondStop = stopBackgroundTasks();

    expect(secondStop).toBe(firstStop);
    pendingListenerStop.resolve();
    await expect(firstStop).resolves.toBe('drained');
    expect(mocks.stopListeningForCounterStrikeClosed).toHaveBeenCalledOnce();
  });

  it('aborts a pending task after the shutdown grace period', async () => {
    vi.useFakeTimers();
    let receivedSignal: AbortSignal | undefined;
    mocks.downloadLastMatchesIfNecessary.mockImplementationOnce((signal: AbortSignal) => {
      receivedSignal = signal;
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    });

    const pendingStart = startBackgroundTasks();
    const rejectedStart = expect(pendingStart).rejects.toBeDefined();
    await Promise.resolve();
    const pendingStop = stopBackgroundTasks();
    const shutdownStop = stopBackgroundTasks({ abortAfterMs: 30_000, abortSettleTimeoutMs: 5_000 });
    expect(shutdownStop).toBe(pendingStop);

    await vi.advanceTimersByTimeAsync(29_999);
    expect(receivedSignal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    await expect(shutdownStop).resolves.toBe('aborted');
    await rejectedStart;
    expect(receivedSignal?.aborted).toBe(true);
    vi.useRealTimers();
  });

  it('does not let a task that ignores cancellation block shutdown', async () => {
    vi.useFakeTimers();
    mocks.downloadLastMatchesIfNecessary.mockReturnValueOnce(new Promise(() => undefined));

    void startBackgroundTasks();
    await Promise.resolve();
    const pendingStop = stopBackgroundTasks({ abortAfterMs: 30_000, abortSettleTimeoutMs: 5_000 });
    await vi.advanceTimersByTimeAsync(35_000);

    await expect(pendingStop).resolves.toBe('timed-out');
    expect(logger.error).toHaveBeenCalledWith('Background tasks did not settle after being cancelled during shutdown');
    vi.useRealTimers();
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

  it('aborts a failed startup session before waiting for listener cleanup', async () => {
    const cleanup = deferred<void>();
    const startupError = new Error('download failed');
    let startupSignal: AbortSignal | undefined;
    mocks.downloadLastMatchesIfNecessary.mockImplementationOnce((signal: AbortSignal) => {
      startupSignal = signal;
      return Promise.reject(startupError);
    });
    mocks.stopListeningForCounterStrikeClosed.mockReturnValueOnce(cleanup.promise);

    const start = startBackgroundTasks();
    const rejectedStart = expect(start).rejects.toBe(startupError);
    await vi.waitFor(() => expect(startupSignal?.aborted).toBe(true));

    const shutdown = stopBackgroundTasks({ abortAfterMs: 30_000, abortSettleTimeoutMs: 5_000 });
    await expect(shutdown).resolves.toBe('drained');
    cleanup.resolve();
    await rejectedStart;
  });
});
