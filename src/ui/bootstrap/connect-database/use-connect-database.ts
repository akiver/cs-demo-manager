import { useCallback } from 'react';
import type { DatabaseSettings } from 'csdm/node/settings/settings';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { connectDatabaseError, connectDatabaseStarted, connectDatabaseSuccess } from '../bootstrap-actions';

// Connects with the given settings and persists them only when the connection succeeded.
export function useConnectDatabase() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const updateSettings = useUpdateSettings();

  return useCallback(
    async (databaseSettings: DatabaseSettings) => {
      dispatch(connectDatabaseStarted());
      const error = await client.send({
        name: RendererClientMessageName.ConnectDatabase,
        payload: databaseSettings,
      });

      if (error) {
        dispatch(connectDatabaseError({ error }));
      } else {
        await updateSettings({
          database: databaseSettings,
        });
        dispatch(connectDatabaseSuccess());
      }

      return error;
    },
    [client, dispatch, updateSettings],
  );
}
