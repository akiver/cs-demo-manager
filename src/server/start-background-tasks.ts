import { downloadLastMatchesIfNecessary } from 'csdm/server/tasks/download-last-matches-if-necessary';
import { BACKGROUND_TASK_DRAIN_TIMEOUT_MS } from 'csdm/common/shutdown-timeouts';
import {
  listenForCounterStrikeClosed,
  stopListeningForCounterStrikeClosed,
} from './tasks/listen-for-counter-strike-closed';
import { checkForNewBannedSteamAccounts } from './tasks/check-for-new-banned-steam-accounts';

type BackgroundTaskSession = {
  scheduledTasksIntervalId: NodeJS.Timeout | null;
  pendingTasks: Set<Promise<unknown>>;
};

let activeSession: BackgroundTaskSession | undefined;
let pendingStop: { promise: Promise<StopBackgroundTasksResult> } | undefined;

export type StopBackgroundTasksResult = 'drained' | 'timed-out';

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
    scheduledTasksIntervalId: null,
    pendingTasks: new Set(),
  };
  activeSession = session;
  try {
    listenForCounterStrikeClosed();
    await trackTask(session, downloadLastMatchesIfNecessary());
    if (activeSession !== session) {
      return;
    }

    await trackTask(session, checkForNewBannedSteamAccounts());
    if (activeSession !== session) {
      return;
    }

    const intervalInMs = 3_600_000; // 1 hour
    session.scheduledTasksIntervalId = setInterval(() => {
      void trackTask(session, checkForNewBannedSteamAccounts()).catch((error) => {
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
    const settle = () => {
      if (timeout !== undefined) {
        clearTimeout(timeout);
        timeout = undefined;
        resolve(true);
      }
    };
    void promise.then(settle, settle);
  });
}

function logTaskResults(results: PromiseSettledResult<unknown>[]) {
  for (const result of results) {
    if (result.status === 'rejected') {
      logger.error('A background task failed while the database was being quiesced');
      logger.error(result.reason);
    }
  }
}

/**
 * ! The wait is always bounded. The callers are the quit sequence and the UI handlers that
 * disconnect or reset the database, and a task waiting on a network response it will never get
 * would otherwise keep them hanging forever.
 */
async function stopActiveBackgroundTasks(): Promise<StopBackgroundTasksResult> {
  const session = activeSession;
  activeSession = undefined;

  if (session?.scheduledTasksIntervalId) {
    clearInterval(session.scheduledTasksIntervalId);
    session.scheduledTasksIntervalId = null;
  }

  const drain = Promise.allSettled([stopListeningForCounterStrikeClosed(), ...(session?.pendingTasks ?? [])]);
  if (await waitForPromise(drain, BACKGROUND_TASK_DRAIN_TIMEOUT_MS)) {
    logTaskResults(await drain);

    return 'drained';
  }

  void drain.then(logTaskResults);
  logger.error('Background tasks did not settle before the database was released');

  return 'timed-out';
}

export function stopBackgroundTasks(): Promise<StopBackgroundTasksResult> {
  // Every caller shares the same deadline, so joining a stop already in flight is simply waiting
  // for it: there is no shorter answer for it to inherit.
  if (pendingStop !== undefined) {
    return pendingStop.promise;
  }

  const stop = stopActiveBackgroundTasks();
  const state = { promise: stop };
  pendingStop = state;
  const clearPendingStop = () => {
    if (pendingStop === state) {
      pendingStop = undefined;
    }
  };
  void stop.then(clearPendingStop, clearPendingStop);

  return stop;
}
