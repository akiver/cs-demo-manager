import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { UpdatePlayerCommentPayload } from 'csdm/server/handlers/renderer-process/player/update-player-comment-handler';
import { playerCommentUpdated } from './player-actions';

export function useUpdatePlayerComment() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();

  return async (payload: UpdatePlayerCommentPayload) => {
    try {
      await client.send({
        name: RendererClientMessageName.UpdatePlayerComment,
        payload,
      });
      dispatch(playerCommentUpdated(payload));
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'comment-update-error',
        type: 'error',
      });
    }
  };
}
