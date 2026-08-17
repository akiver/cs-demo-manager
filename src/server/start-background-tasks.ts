import { downloadLastMatchesIfNecessary } from 'csdm/server/tasks/download-last-matches-if-necessary';
import {
  listenForCounterStrikeClosed,
  stopListeningForCounterStrikeClosed,
} from './tasks/listen-for-counter-strike-closed';
import { checkForNewBannedSteamAccounts } from './tasks/check-for-new-banned-steam-accounts';

type BackgroundTaskSession = {
  abortController: AbortController;
  scheduledTasksIntervalId: NodeJS.Timeout | null;
  pendingTasks: Set<Promise<unknown>>;
};

let activeSession: BackgroundTaskSession | undefined;
let pendingStop:
  | {
      promise: Promise<StopBackgroundTasksResult>;
      requestShutdown: (options: ShutdownStopOptions) => void;
    }
  | undefined;

export type StopBackgroundTasksResult = 'drained' | 'aborted' | 'timed-out';

type StopBackgroundTasksOptions = {
  abortAfterMs?: number;
  abortSettleTimeoutMs?: number;
};

type ShutdownStopOptions = StopBackgroundTasksOptions & { abortAfterMs: number };

function trackTask<T>(session: BackgroundTaskSession, task: Promise<T>) {
  session.pendingTasks.add(task);
  void task.then(
    () => session.pendingTasks.delete(task),
    () => session.pendingTasks.delete(task),
  );

  return task;
}

async function startBackgroundTasksAfterPendingStop() {
  if (pendingStop !== undefined) {
    await pendingStop.promise;
  }

  // Prevents starting background tasks multiple times.
  // e.g. when the renderer window is closed and opened again.
  if (activeSession !== undefined) {
    return;
  }

  const session: BackgroundTaskSession = {
    abortController: new AbortController(),
    scheduledTasksIntervalId: null,
    pendingTasks: new Set(),
  };
  activeSession = session;
  try {
    const { signal } = session.abortController;
    listenForCounterStrikeClosed(signal);
    await trackTask(session, downloadLastMatchesIfNecessary(signal));
    if (activeSession !== session) {
      return;
    }

    const runScheduledTasks = async () => {
      signal.throwIfAborted();
      await checkForNewBannedSteamAccounts(signal);
    };

    await trackTask(session, runScheduledTasks());
    if (activeSession !== session) {
      return;
    }

    const intervalInMs = 3_600_000; // 1 hour
    session.scheduledTasksIntervalId = setInterval(() => {
      void trackTask(session, runScheduledTasks()).catch((error) => {
        logger.error('Error while running a scheduled background task');
        logger.error(error);
      });
    }, intervalInMs);
  } catch (error) {
    if (activeSession === session) {
      activeSession = undefined;
      try {
        await stopListeningForCounterStrikeClosed();
      } catch (cleanupError) {
        logger.error('Failed to stop the Counter-Strike listener after background task startup failed');
        logger.error(cleanupError);
      }
    }
    throw error;
  }
}

export function startBackgroundTasks() {
  return startBackgroundTasksAfterPendingStop();
}

function waitForPromise(promise: Promise<unknown>, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let timeout: NodeJS.Timeout | undefined = setTimeout(resolve, timeoutMs, false);
    void promise.then(
      () => {
        if (timeout !== undefined) {
          clearTimeout(timeout);
          timeout = undefined;
          resolve(true);
        }
      },
      () => {
        if (timeout !== undefined) {
          clearTimeout(timeout);
          timeout = undefined;
          resolve(true);
        }
      },
    );
  });
}

function logTaskResults(results: PromiseSettledResult<unknown>[]) {
  for (const result of results) {
    if (result.status === 'rejected' && !(result.reason instanceof Error && result.reason.name === 'AbortError')) {
      logger.error('A background task failed while the database was being quiesced');
      logger.error(result.reason);
    }
  }
}

async function stopActiveBackgroundTasks(
  shutdownRequested: Promise<ShutdownStopOptions>,
): Promise<StopBackgroundTasksResult> {
  const session = activeSession;
  activeSession = undefined;

  if (session?.scheduledTasksIntervalId) {
    clearInterval(session.scheduledTasksIntervalId);
    session.scheduledTasksIntervalId = null;
  }

  const tasks = [stopListeningForCounterStrikeClosed(), ...(session?.pendingTasks ?? [])];
  const drain = Promise.allSettled(tasks);
  const firstResult = await Promise.race([
    drain.then(() => ({ type: 'drained' as const })),
    shutdownRequested.then((options) => ({ options, type: 'shutdown' as const })),
  ]);
  if (firstResult.type === 'drained') {
    logTaskResults(await drain);
    return 'drained';
  }

  const { abortAfterMs, abortSettleTimeoutMs } = firstResult.options;
  if (await waitForPromise(drain, abortAfterMs)) {
    logTaskResults(await drain);
    return 'drained';
  }

  session?.abortController.abort();
  if (abortSettleTimeoutMs === undefined || (await waitForPromise(drain, abortSettleTimeoutMs))) {
    logTaskResults(await drain);
    return 'aborted';
  }

  void drain.then(logTaskResults);
  logger.error('Background tasks did not settle after being cancelled during shutdown');

  return 'timed-out';
}

export function stopBackgroundTasks(options: StopBackgroundTasksOptions = {}): Promise<StopBackgroundTasksResult> {
  if (pendingStop !== undefined) {
    if (options.abortAfterMs !== undefined) {
      pendingStop.requestShutdown({ ...options, abortAfterMs: options.abortAfterMs });
    }
    return pendingStop.promise;
  }

  let requestShutdown!: (options: ShutdownStopOptions) => void;
  const shutdownRequested = new Promise<ShutdownStopOptions>((resolve) => {
    requestShutdown = resolve;
  });
  const stop = stopActiveBackgroundTasks(shutdownRequested);
  const state = { promise: stop, requestShutdown };
  pendingStop = state;
  if (options.abortAfterMs !== undefined) {
    requestShutdown({ ...options, abortAfterMs: options.abortAfterMs });
  }
  void stop.then(
    () => {
      if (pendingStop === state) {
        pendingStop = undefined;
      }
    },
    () => {
      if (pendingStop === state) {
        pendingStop = undefined;
      }
    },
  );

  return stop;
}
