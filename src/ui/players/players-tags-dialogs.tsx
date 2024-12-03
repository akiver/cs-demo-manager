import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { playersTagsUpdated } from 'csdm/ui/tags/tags-actions';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import type { UpdatePlayersTagsPayload } from 'csdm/server/handlers/renderer-process/tags/update-players-tags-handler';
import { TagsDialog } from 'csdm/ui/dialogs/tags-dialog';

type Props = {
  steamIds: string[];
  defaultTagIds: string[];
};

export function PlayersTagsDialog({ steamIds, defaultTagIds }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();

  const onTagIdsUpdated = async (tagIds: string[]) => {
    try {
      const payload: UpdatePlayersTagsPayload = {
        steamIds,
        tagIds,
      };
      await client.send({
        name: RendererClientMessageName.UpdatePlayersTags,
        payload,
      });

      dispatch(
        playersTagsUpdated({
          steamIds,
          tagIds,
        }),
      );
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'players-tags-update-error',
        type: 'error',
      });
    }
  };

  return <TagsDialog onTagIdsUpdated={onTagIdsUpdated} defaultTagIds={defaultTagIds} />;
}
