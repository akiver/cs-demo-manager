import { deleteDaemonInfoFile } from 'csdm/node/daemon/daemon-info-file';

export async function shutdownDaemonHandler() {
  logger.log('Daemon shutdown requested, exiting');
  await deleteDaemonInfoFile();
  // Delay the exit so the reply reaches the client first.
  setTimeout(() => {
    process.exit(0);
  }, 100);
}
