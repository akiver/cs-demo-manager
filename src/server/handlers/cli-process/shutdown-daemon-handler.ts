import { deleteDaemonInfoFile } from 'csdm/node/daemon/daemon-info-file';
import { hasWorkInProgress } from 'csdm/server/idle-monitor/idle-monitor';
import { server } from 'csdm/server/server';

export async function shutdownDaemonHandler() {
  // The requester probed the daemon before asking for the shutdown, but a client may have connected or queued work
  // since then: re-check before exiting, the requester will attach to this daemon instead.
  if (server.getClientCount() > 0 || hasWorkInProgress()) {
    logger.log('Daemon shutdown refused, clients are connected or work is in progress');
    return;
  }

  logger.log('Daemon shutdown requested, exiting');
  await deleteDaemonInfoFile();
  // Delay the exit so the reply reaches the client first.
  setTimeout(() => {
    process.exit(0);
  }, 100);
}
