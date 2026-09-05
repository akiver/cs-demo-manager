import type { DatabaseSettings } from 'csdm/node/settings/settings';
import type { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { startDatabaseConnection } from 'csdm/server/ensure-database-connection';
import { getSettings } from 'csdm/node/settings/get-settings';
import { DatabaseMode } from 'csdm/common/types/database-mode';
import { stopEmbeddedPostgreSqlIfUnused } from 'csdm/server/stop-embedded-postgresql-if-unused';

export type ConnectDatabaseError = {
  code: ErrorCode;
  message: string;
};

export async function connectDatabaseHandler(databaseSettings: DatabaseSettings | undefined) {
  try {
    if (databaseSettings === undefined) {
      const settings = await getSettings();
      databaseSettings = settings.database;
    }
    if (databaseSettings.mode !== DatabaseMode.Embedded) {
      await stopEmbeddedPostgreSqlIfUnused();
    }
    await startDatabaseConnection(databaseSettings);
  } catch (error) {
    logger.error('Error while connecting to the database');
    logger.error(error);
    const code = getErrorCodeFromError(error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    const payload: ConnectDatabaseError = {
      code,
      message,
    };

    return payload;
  }
}
