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
import { connectDatabaseError, connectDatabaseSuccess } from '../bootstrap-actions';
import { buildUiDatabaseOperationError } from 'csdm/ui/shared/format-error';

/**
 * Connects with the given settings and persists them only when the connection succeeded.
 *
 * ! It never moves the status to a "connecting" state. Doing so would swap the tree for the loading
 * screen and unmount the connection form, throwing away the credentials the user just typed.
 * Callers show their own busy state instead.
 */
export function useConnectDatabase() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { t } = useLingui();

  return useCallback(
    async (databaseSettings: DatabaseSettings): Promise<DatabaseOperationError | undefined> => {
      let result: ConnectDatabaseResult;
      try {
        result = await client.send({
          name: RendererClientMessageName.ConnectDatabase,
          payload: databaseSettings,
        });
      } catch (error) {
        const failure = buildUiDatabaseOperationError(error, t`Unknown error`);
        dispatch(connectDatabaseError({ error: failure }));

        return failure;
      }

      if (result.error) {
        dispatch(connectDatabaseError({ error: result.error }));

        return result.error;
      }

      if (result.settings === undefined) {
        const failure: DatabaseOperationError = {
          code: ErrorCode.UnknownError,
          message: t`The database connection returned an invalid response.`,
        };
        dispatch(connectDatabaseError({ error: failure }));

        return failure;
      }

      dispatch(settingsUpdated({ settings: result.settings }));
      dispatch(connectDatabaseSuccess());

      return undefined;
    },
    [client, dispatch, t],
  );
}
