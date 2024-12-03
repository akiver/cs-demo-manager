import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { UpdateCommentPayload } from 'csdm/server/handlers/renderer-process/match/update-comment-handler';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';

export function useUpdateComment() {
  const client = useWebSocketClient();
  const showToast = useShowToast();
  const dispatch = useDispatch();

  return async (payload: UpdateCommentPayload) => {
    try {
      await client.send({
        name: RendererClientMessageName.UpdateComment,
        payload,
      });
      dispatch(commentUpdated(payload));
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'comment-update-error',
        type: 'error',
      });
    }
  };
}
