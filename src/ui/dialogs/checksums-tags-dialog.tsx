import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { UpdateChecksumsTagsPayload } from 'csdm/server/handlers/renderer-process/tags/update-checksums-tags-handler';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { checksumsTagsUpdated } from 'csdm/ui/tags/tags-actions';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { TagsDialog } from './tags-dialog';

type Props = {
  checksums: string[];
  defaultTagIds: string[];
};

export function ChecksumsTagsDialog({ checksums, defaultTagIds }: Props) {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();

  const onTagIdsUpdated = async (tagIds: string[]) => {
    try {
      const payload: UpdateChecksumsTagsPayload = {
        checksums,
        tagIds,
      };
      await client.send({
        name: RendererClientMessageName.UpdateChecksumTags,
        payload,
      });

      dispatch(
        checksumsTagsUpdated({
          checksums,
          tagIds,
        }),
      );
    } catch (error) {
      showToast({
        content: <Trans>An error occurred</Trans>,
        id: 'checksums-tags-update-error',
        type: 'error',
      });
    }
  };

  return <TagsDialog onTagIdsUpdated={onTagIdsUpdated} defaultTagIds={defaultTagIds} />;
}
