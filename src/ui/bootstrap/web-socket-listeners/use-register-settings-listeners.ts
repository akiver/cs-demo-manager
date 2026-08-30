import { useEffect } from 'react';
import { settingsUpdated } from 'csdm/ui/settings/settings-actions';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import type { Settings } from 'csdm/node/settings/settings';

export function useRegisterSettingsListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onSettingsUpdated = (settings: Settings) => {
      dispatch(settingsUpdated({ settings }));
    };

    client.on(ServerPushMessageName.SettingsUpdated, onSettingsUpdated);

    return () => {
      client.off(ServerPushMessageName.SettingsUpdated, onSettingsUpdated);
    };
  });
}
