import { useCallback } from 'react';
import { useLingui } from '@lingui/react/macro';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { ErrorCode } from 'csdm/common/error-code';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { ConnectDatabaseError } from 'csdm/server/handlers/renderer-process/database/connect-database-handler';
import { connectDatabaseError, connectDatabaseStarted, connectDatabaseSuccess } from '../bootstrap-actions';

// Connects with the given settings and persists them only when the connection succeeded.
export function useConnectDatabase() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const updateSettings = useUpdateSettings();
  const { t } = useLingui();

  return useCallback(
    async (databaseSettings: DatabaseSettings): Promise<ConnectDatabaseError | undefined> => {
      dispatch(connectDatabaseStarted());
      const error: ConnectDatabaseError | undefined = await client.send({
        name: RendererClientMessageName.ConnectDatabase,
        payload: databaseSettings,
      });

      if (error) {
        dispatch(connectDatabaseError({ error }));

        return error;
      }

      try {
        await updateSettings({
          database: databaseSettings,
        });
      } catch (settingsError) {
        // ! The connection succeeded but the app can't remember it. Reporting it as a failure is what
        // keeps the UI out of the "connecting" state it would otherwise never leave.
        logger.error(settingsError);
        const failure: ConnectDatabaseError = {
          code: ErrorCode.UnknownError,
          message: t`The connection succeeded but the settings could not be saved.`,
        };
        dispatch(connectDatabaseError({ error: failure }));

        return failure;
      }

      dispatch(connectDatabaseSuccess());

      return undefined;
    },
    [client, dispatch, updateSettings, t],
  );
}
