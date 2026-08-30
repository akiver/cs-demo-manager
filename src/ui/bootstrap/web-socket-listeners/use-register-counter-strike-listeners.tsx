import { useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import type { CounterStrikeErrorPayload, WatchDemoErrorPayload } from 'csdm/server/counter-strike';
import { getPlaybackErrorMessageFromErrorCode } from 'csdm/ui/shared/get-playback-error-from-error-code';

export function useRegisterCounterStrikeListeners(client: WebSocketClient) {
  const showToast = useShowToast();
  const { t } = useLingui();

  useEffect(() => {
    const onGameStart = () => {
      showToast({
        id: 'game-starting',
        content: t`Counter-Strike starting…`,
      });
    };

    const onError = (error: CounterStrikeErrorPayload | WatchDemoErrorPayload) => {
      const message = getPlaybackErrorMessageFromErrorCode(error.errorCode, error.game);
      showToast({
        content: message,
        id: 'game-starting',
        type: 'error',
      });
    };

    client.on(ServerPushMessageName.StartingCounterStrike, onGameStart);
    client.on(ServerPushMessageName.CounterStrikeError, onError);

    return () => {
      client.off(ServerPushMessageName.StartingCounterStrike, onGameStart);
      client.off(ServerPushMessageName.CounterStrikeError, onError);
    };
  });
}
