import { server } from 'csdm/server/server';
import { analysesListener } from 'csdm/server/analyses-listener';
import { videoQueue } from 'csdm/server/video-queue';
import { downloadDemoQueue } from 'csdm/server/download-queue';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';
import { deleteDaemonInfoFile } from 'csdm/node/daemon/daemon-info-file';
import { createIdleMonitor } from './create-idle-monitor';

// The daemon has work in progress, regardless of connected clients.
export function hasWorkInProgress() {
  return analysesListener.hasAnalysesInProgress() || videoQueue.isBusy() || downloadDemoQueue.hasDownloads();
}

export function startIdleMonitor() {
  const monitor = createIdleMonitor(
    () => {
      return server.getClientCount() > 0 || hasWorkInProgress();
    },
    async () => {
      monitor.stop();
      logger.log('Daemon is idle, exiting');
      stopBackgroundTasks();
      try {
        await deleteDaemonInfoFile();
      } finally {
        process.exit(0);
      }
    },
  );

  monitor.start();
}
