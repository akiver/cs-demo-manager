import { downloadLastMatchesIfNecessary } from 'csdm/server/tasks/download-last-matches-if-necessary';
import { listenForCounterStrikeClosed } from './tasks/listen-for-counter-strike-closed';
import { checkForNewBannedSteamAccounts } from './tasks/check-for-new-banned-steam-accounts';

// Prevents starting background tasks multiple times.
// e.g. when the renderer window is closed and opened again.
let areTasksRunning = false;

export function startBackgroundTasks() {
  if (areTasksRunning) {
    return;
  }

  listenForCounterStrikeClosed();
  downloadLastMatchesIfNecessary();

  const runScheduledTasks = async () => {
    await checkForNewBannedSteamAccounts();
  };

  runScheduledTasks();
  const intervalInMs = 3_600_000; // 1 hour
  setInterval(runScheduledTasks, intervalInMs);

  areTasksRunning = true;
}
