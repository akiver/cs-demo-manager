import { destroyDatabaseConnection } from 'csdm/node/database/database';
import { stopBackgroundTasks } from 'csdm/server/start-background-tasks';
import type { DatabaseMode, Settings } from 'csdm/node/settings/settings';
import { analysesListener } from 'csdm/server/analyses-listener';
import { DatabaseTransitionInProgress } from 'csdm/node/database/errors/database-transition-in-progress';
import { buildDatabaseOperationError, type DatabaseOperationError } from 'csdm/server/database-operation-error';
import { getSettings } from 'csdm/node/settings/get-settings';
import { updateSettings } from 'csdm/node/settings/update-settings';
import { connectDatabase } from 'csdm/node/database/connect-database';

export type DisconnectDatabasePayload = {
  nextMode?: DatabaseMode;
};

export type DisconnectDatabaseResult = {
  error?: DatabaseOperationError;
  settings?: Settings;
};

export async function disconnectDatabaseConnectionHandler(
  payload: DisconnectDatabasePayload | undefined,
): Promise<DisconnectDatabaseResult> {
  const releaseTransition = analysesListener.tryBeginDatabaseTransition();
  if (releaseTransition === undefined) {
    return { error: buildDatabaseOperationError(new DatabaseTransitionInProgress()) };
  }

  let previousSettings: Settings | undefined;
  try {
    previousSettings = await getSettings();
    await stopBackgroundTasks();
    await destroyDatabaseConnection({ stopEmbeddedIfUnused: payload?.nextMode === 'external' });

    if (payload?.nextMode !== undefined) {
      const settings = await updateSettings({
        database: {
          ...previousSettings.database,
          mode: payload.nextMode,
        },
      });

      return { settings };
    }

    return {};
  } catch (error) {
    logger.error('Error while disconnecting the database connection');
    logger.error(error);

    if (previousSettings !== undefined) {
      try {
        await connectDatabase(previousSettings.database);
      } catch (reconnectionError) {
        logger.error('Failed to restore the database connection after a disconnection failure');
        logger.error(reconnectionError);
      }
    }

    return { error: buildDatabaseOperationError(error) };
  } finally {
    releaseTransition();
  }
}
