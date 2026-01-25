import React, { useEffect } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import type { CounterStrikeErrorPayload, WatchDemoErrorPayload } from 'csdm/server/counter-strike';
import { getPlaybackErrorMessageFromErrorCode } from 'csdm/ui/shared/get-playback-error-from-error-code';

function getErrorMessageFromError(error: WatchDemoErrorPayload | CounterStrikeErrorPayload) {
  if (error.game) {
    return getPlaybackErrorMessageFromErrorCode(error.game, error.errorCode);
  }

  return (
    <p>
      <Trans>An error occurred</Trans>
    </p>
  );
}

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
      const message = getErrorMessageFromError(error);
      showToast({
        content: message,
        id: 'game-starting',
        type: 'error',
      });
    };

    client.on(RendererServerMessageName.StartingCounterStrike, onGameStart);
    client.on(RendererServerMessageName.CounterStrikeError, onError);

    return () => {
      client.off(RendererServerMessageName.StartingCounterStrike, onGameStart);
      client.off(RendererServerMessageName.CounterStrikeError, onError);
    };
  });
}
