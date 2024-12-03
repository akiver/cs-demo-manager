import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';

export function useRemoveVideos() {
  const [isRemovingVideos, setIsRemovingVideos] = useState(false);
  const client = useWebSocketClient();
  const showToast = useShowToast();

  const removeVideos = async (ids: string[]) => {
    try {
      setIsRemovingVideos(true);
      await client.send({
        name: RendererClientMessageName.RemoveVideosFromQueue,
        payload: ids,
      });
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        type: 'error',
      });
    } finally {
      setIsRemovingVideos(false);
    }
  };

  return { isRemovingVideos, removeVideos };
}
