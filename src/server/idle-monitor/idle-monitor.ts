import { server } from 'csdm/server/server';
import { analysesListener } from 'csdm/server/analyses-listener';
import { videoQueue } from 'csdm/server/video-queue';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { exitDaemon } from 'csdm/server/exit-daemon';
import { createIdleMonitor } from './create-idle-monitor';
import { isDatabaseConnectionPending } from 'csdm/server/ensure-database-connection';
import { krispShotWorker } from 'csdm/server/krispshot/krispshot-worker';

// The daemon has work in progress, regardless of connected clients.
// A pending database connection counts: it may be starting the embedded server or running migrations, exiting in
// the middle would waste that work and the next daemon would start over.
export function hasWorkInProgress() {
  return (
    analysesListener.hasAnalysesInProgress() ||
    videoQueue.isBusy() ||
    downloadDemoQueue.hasDownloads() ||
    isDatabaseConnectionPending() ||
    // KrispShot: a clip being made.
    krispShotWorker.isBusy()
  );
}

export function startIdleMonitor() {
  const monitor = createIdleMonitor(
    () => {
      // KrispShot: an enabled clip worker keeps the daemon running when the window is closed (it doesn't block a
      // daemon replacement by a newer version while idle, see hasWorkInProgress).
      return server.getClientCount() > 0 || hasWorkInProgress() || krispShotWorker.isEnabled();
    },
    async () => {
      monitor.stop();
      logger.log('Daemon is idle, exiting');
      await exitDaemon();
    },
  );

  monitor.start();
}
