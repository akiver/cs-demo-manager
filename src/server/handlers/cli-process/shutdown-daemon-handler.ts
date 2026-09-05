import { deleteDaemonInfoFile } from 'csdm/node/daemon/daemon-info-file';
import { hasWorkInProgress } from 'csdm/server/idle-monitor/idle-monitor';
import { server } from 'csdm/server/server';
import { exitDaemon } from 'csdm/server/exit-daemon';

/**
 * Returns whether the daemon accepted to exit, so the requester knows if it has to wait for it to be gone.
 */
export async function shutdownDaemonHandler(): Promise<boolean> {
  // The requester probed the daemon before asking for the shutdown, but a client may have connected or queued work
  // since then: re-check before exiting, the requester will attach to this daemon instead.
  if (server.getClientCount() > 0 || hasWorkInProgress()) {
    logger.log('Daemon shutdown refused, clients are connected or work is in progress');
    return false;
  }

  logger.log('Daemon shutdown requested, exiting');
  // Deleted right away so the requester stops discovering this daemon. exitDaemon() deletes it again but only if it
  // still belongs to this process: a daemon spawned during the delay below may have written its own file already.
  await deleteDaemonInfoFile(process.pid);
  // Delay the exit so the reply reaches the client first: exitDaemon() closes the WebSocket server, which terminates
  // the requester's socket.
  setTimeout(() => {
    void exitDaemon();
  }, 100);

  return true;
}
