import { useCallback } from 'react';
import { useLingui } from '@lingui/react/macro';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { ErrorCode } from 'csdm/common/error-code';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { ConnectDatabaseResult } from 'csdm/server/handlers/renderer-process/database/connect-database-handler';
import type { DatabaseOperationError } from 'csdm/server/database-operation-error';
import { settingsUpdated } from 'csdm/ui/settings/settings-actions';
import { connectDatabaseError, connectDatabaseStarted, connectDatabaseSuccess } from '../bootstrap-actions';
import { buildUiDatabaseOperationError } from 'csdm/ui/shared/format-error';

export type DatabaseConnectionPresentation = 'bootstrap' | 'in-place';

// Connects with the given settings and persists them only when the connection succeeded.
export function useConnectDatabase() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { t } = useLingui();

  return useCallback(
    async (
      databaseSettings: DatabaseSettings,
      presentation: DatabaseConnectionPresentation = 'bootstrap',
    ): Promise<DatabaseOperationError | undefined> => {
      if (presentation === 'bootstrap') {
        dispatch(connectDatabaseStarted());
      }

      let result: ConnectDatabaseResult;
      try {
        result = await client.send({
          name: RendererClientMessageName.ConnectDatabase,
          payload: databaseSettings,
        });
      } catch (error) {
        const failure = buildUiDatabaseOperationError(error, t`Unknown error`);
        if (presentation === 'bootstrap') {
          dispatch(connectDatabaseError({ error: failure }));
        }

        return failure;
      }

      if (result.error) {
        if (presentation === 'bootstrap') {
          dispatch(connectDatabaseError({ error: result.error }));
        }

        return result.error;
      }

      if (result.settings === undefined) {
        const failure: DatabaseOperationError = {
          code: ErrorCode.UnknownError,
          message: t`The database connection returned an invalid response.`,
        };
        if (presentation === 'bootstrap') {
          dispatch(connectDatabaseError({ error: failure }));
        }

        return failure;
      }

      dispatch(settingsUpdated({ settings: result.settings }));
      if (presentation === 'bootstrap') {
        dispatch(connectDatabaseSuccess());
      }

      return undefined;
    },
    [client, dispatch, t],
  );
}
