import { server } from 'csdm/server/server';
import { analysesListener } from 'csdm/server/analyses-listener';
import { videoQueue } from 'csdm/server/video-queue';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { exitDaemon } from 'csdm/server/exit-daemon';
import { createIdleMonitor } from './create-idle-monitor';
import { isDatabaseConnectionPending } from 'csdm/server/ensure-database-connection';

// The daemon has work in progress, regardless of connected clients.
// A pending database connection counts: it may be starting the embedded server or running migrations, exiting in
// the middle would waste that work and the next daemon would start over.
export function hasWorkInProgress() {
  return (
    analysesListener.hasAnalysesInProgress() ||
    videoQueue.isBusy() ||
    downloadDemoQueue.hasDownloads() ||
    isDatabaseConnectionPending()
  );
}

export function startIdleMonitor() {
  const monitor = createIdleMonitor(
    () => {
      return server.getClientCount() > 0 || hasWorkInProgress();
    },
    async () => {
      monitor.stop();
      logger.log('Daemon is idle, exiting');
      await exitDaemon();
    },
  );

  monitor.start();
}
