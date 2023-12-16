import { downloadLastMatchesIfNecessary } from 'csdm/server/tasks/download-last-matches-if-necessary';
import {
  listenForCounterStrikeClosed,
  stopListeningForCounterStrikeClosed,
} from './tasks/listen-for-counter-strike-closed';
import { checkForNewBannedSteamAccounts } from './tasks/check-for-new-banned-steam-accounts';

let scheduledTasksIntervalId: NodeJS.Timeout | null = null;

export function startBackgroundTasks() {
  // Prevents starting background tasks multiple times.
  // e.g. when the renderer window is closed and opened again.
  if (scheduledTasksIntervalId) {
    return;
  }

  listenForCounterStrikeClosed();
  downloadLastMatchesIfNecessary();

  const runScheduledTasks = async () => {
    await checkForNewBannedSteamAccounts();
  };

  runScheduledTasks();
  const intervalInMs = 3_600_000; // 1 hour
  scheduledTasksIntervalId = setInterval(runScheduledTasks, intervalInMs);
}

export function stopBackgroundTasks() {
  stopListeningForCounterStrikeClosed();
  if (scheduledTasksIntervalId) {
    clearInterval(scheduledTasksIntervalId);
  }
  scheduledTasksIntervalId = null;
}
