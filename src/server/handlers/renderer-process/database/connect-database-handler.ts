import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { Settings } from 'csdm/node/settings/settings';
import { connectDatabase, connectDatabaseAndPersist } from 'csdm/node/database/connect-database';
import { getSettings } from 'csdm/node/settings/get-settings';
import { buildDatabaseOperationError, type DatabaseOperationError } from 'csdm/server/database-operation-error';
import { analysesListener } from 'csdm/server/analyses-listener';
import { DatabaseTransitionInProgress } from 'csdm/node/database/errors/database-transition-in-progress';

export type ConnectDatabaseResult = {
  error?: DatabaseOperationError;
  settings?: Settings;
};
export type ConnectDatabaseError = DatabaseOperationError;

export async function connectDatabaseHandler(
  databaseSettings: DatabaseSettings | undefined,
): Promise<ConnectDatabaseResult> {
  const releaseTransition = analysesListener.tryBeginDatabaseTransition();
  if (releaseTransition === undefined) {
    return { error: buildDatabaseOperationError(new DatabaseTransitionInProgress()) };
  }

  try {
    const settings =
      databaseSettings === undefined
        ? await connectDatabase().then(() => getSettings())
        : await connectDatabaseAndPersist(databaseSettings);

    return { settings };
  } catch (error) {
    logger.error('Error while connecting to the database');
    logger.error(error);

    return { error: buildDatabaseOperationError(error) };
  } finally {
    releaseTransition();
  }
}
