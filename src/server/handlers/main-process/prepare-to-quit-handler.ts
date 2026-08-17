import { beginDatabaseConnectionCleanup } from 'csdm/node/database/database';
import { stopEmbeddedCluster } from 'csdm/node/database/embedded/stop-cluster';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';
import {
  BACKGROUND_TASK_ABORT_SETTLE_TIMEOUT_MS,
  BACKGROUND_TASK_SHUTDOWN_GRACE_MS,
} from 'csdm/common/shutdown-timeouts';

async function prepareToQuit() {
  try {
    const backgroundTaskResult = await stopBackgroundTasks({
      abortAfterMs: BACKGROUND_TASK_SHUTDOWN_GRACE_MS,
      abortSettleTimeoutMs: BACKGROUND_TASK_ABORT_SETTLE_TIMEOUT_MS,
    });
    if (backgroundTaskResult === 'timed-out') {
      logger.error('Continuing shutdown after background tasks ignored cancellation');
    }
  } catch (error) {
    logger.error('Failed to stop background tasks while quitting');
    logger.error(error);
  }

  const cleanup = beginDatabaseConnectionCleanup({
    stopEmbeddedIfUnused: false,
    releasePendingEmbeddedWithoutStopping: true,
  });
  try {
    await cleanup.embeddedSessionsReleased;
  } catch (error) {
    logger.error('Error while releasing the built-in database session');
    logger.error(error);
  }

  // The lifecycle lock itself may fail before the inner PostgreSQL stop can handle its errors. The
  // shutdown promise must still settle so the signal safety path can exit the process.
  try {
    const stopped = await stopEmbeddedCluster({ validationPassword: cleanup.embeddedValidationPassword });
    if (!stopped) {
      logger.log('The built-in database remains running after application shutdown');
    }
  } catch (error) {
    logger.error('Failed to stop the built-in database while quitting');
    logger.error(error);
  }

  // PostgreSQL is no longer left behind by this process. Pool cleanup can finish in the background;
  // the main process will terminate this server immediately after the PrepareToQuit response.
  void cleanup.resourcesDestroyed.catch((error) => {
    logger.error('Failed to finish database resource cleanup while quitting');
    logger.error(error);
  });
}

let pendingShutdown: Promise<void> | undefined;

/**
 * Releases the resources that outlive the process before the app quits.
 * It exists because the embedded PostgreSQL cluster is started detached by pg_ctl: killing the
 * server process is not enough to stop it.
 *
 * ! The shutdown is started only once: on POSIX the main process sends a SIGTERM right after the
 * PrepareToQuit reply, and the signal handler goes through here again.
 */
export function prepareToQuitHandler(): Promise<void> {
  pendingShutdown ??= prepareToQuit();

  return pendingShutdown;
}
