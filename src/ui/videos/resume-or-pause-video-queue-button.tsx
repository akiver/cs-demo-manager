import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useWebSocketClient } from '../hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useVideoQueuePaused } from './use-is-video-queue-paused';

export function ResumeOrPauseVideoQueueButton() {
  const client = useWebSocketClient();
  const isPaused = useVideoQueuePaused();

  return (
    <Button
      variant={isPaused ? ButtonVariant.Primary : ButtonVariant.Default}
      onClick={() => {
        client.send({
          name: isPaused ? RendererClientMessageName.ResumeVideoQueue : RendererClientMessageName.PauseVideoQueue,
        });
      }}
    >
      {isPaused ? <Trans context="Button">Resume</Trans> : <Trans context="Button">Pause</Trans>}
    </Button>
  );
}
