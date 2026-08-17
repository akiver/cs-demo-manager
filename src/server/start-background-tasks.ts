import { downloadLastMatchesIfNecessary } from 'csdm/server/tasks/download-last-matches-if-necessary';
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

function trackTask<T>(session: BackgroundTaskSession, task: Promise<T>) {
  session.pendingTasks.add(task);
  void task.then(
    () => session.pendingTasks.delete(task),
    () => session.pendingTasks.delete(task),
  );

  return task;
}

export async function startBackgroundTasks() {
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

    const runScheduledTasks = async () => {
      await checkForNewBannedSteamAccounts();
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

export async function stopBackgroundTasks() {
  const session = activeSession;
  activeSession = undefined;

  if (session?.scheduledTasksIntervalId) {
    clearInterval(session.scheduledTasksIntervalId);
    session.scheduledTasksIntervalId = null;
  }

  const tasks = [stopListeningForCounterStrikeClosed(), ...(session?.pendingTasks ?? [])];
  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === 'rejected') {
      logger.error('A background task failed while the database was being quiesced');
      logger.error(result.reason);
    }
  }
}
