import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { stopEmbeddedPostgreSql } from 'csdm/node/database/embedded/embedded-postgresql';
import { deleteDaemonInfoFile } from 'csdm/node/daemon/daemon-info-file';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';
import { server } from 'csdm/server/server';

let pendingExit: Promise<void> | null = null;

export function isDaemonExiting() {
  return pendingExit !== null;
}

async function releaseResourcesAndExit(exitCode: number) {
  // A stuck query or a hung embedded server could block the steps below forever, so the process exits anyway after
  // this delay (the next daemon stops any server left behind).
  // Stopping the embedded server alone may take up to 40s: pg_ctl waits 30s for a fast stop then 10s for an immediate
  // one.
  const timeout = 60_000;

  setTimeout(() => {
    logger.error(`The daemon did not exit within ${timeout}ms, forcing the exit`);
    process.exit(1);
  }, timeout);

  stopBackgroundTasks();
  // Releasing the resources takes a few seconds when the embedded database server has to stop. A GUI or CLI starting
  // in the meantime must neither discover this daemon (it would lose its connection moments later) nor find its port
  // taken (the daemon it spawns would probe this one and exit as a duplicate): the discovery file is deleted and the
  // WebSocket server closed before anything slow happens.
  await deleteDaemonInfoFile(process.pid);
  try {
    await server.close();
  } catch (error) {
    logger.error('Error while closing the WebSocket server before exiting');
    logger.error(error);
  }

  try {
    await destroyDatabaseConnection();
  } catch (error) {
    logger.error('Error while closing the database connection before exiting');
    logger.error(error);
  }

  try {
    await stopEmbeddedPostgreSql();
  } catch (error) {
    logger.error('Error while stopping the embedded database server before exiting');
    logger.error(error);
  }

  process.exit(exitCode);
}

/**
 * Releases what the daemon owns then exits the process.
 * The embedded database server would otherwise outlive the daemon and be stopped only by the next daemon start.
 * Calling it again while an exit is in progress returns the pending one.
 */
export function exitDaemon(exitCode = 0): Promise<void> {
  if (pendingExit === null) {
    pendingExit = releaseResourcesAndExit(exitCode);
  }

  return pendingExit;
}
