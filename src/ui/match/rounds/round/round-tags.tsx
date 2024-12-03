import React from 'react';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { Panel } from 'csdm/ui/components/panel';
import { Trans } from '@lingui/react/macro';
import { useCurrentRound } from './use-current-round';
import { Button } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Tag, TagsTooltip } from 'csdm/ui/components/tags/tag';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { TagsDialog } from 'csdm/ui/dialogs/tags-dialog';
import type { UpdateRoundTagsPayload } from 'csdm/server/handlers/renderer-process/tags/update-round-tags-handler';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { roundTagsUpdated } from 'csdm/ui/tags/tags-actions';

export function RoundTags() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const showToast = useShowToast();
  const { showDialog } = useDialog();
  const { checksum } = useCurrentMatch();
  const round = useCurrentRound();

  const { tagIds } = round;
  const visibleTagIds = tagIds.slice(0, 10);
  const hiddenTagIds = tagIds.slice(10);

  const onTagIdsUpdated = async (tagIds: string[]) => {
    try {
      const payload: UpdateRoundTagsPayload = {
        checksum,
        roundNumber: round.number,
        tagIds,
      };
      await client.send({
        name: RendererClientMessageName.UpdateRoundTags,
        payload,
      });

      dispatch(
        roundTagsUpdated({
          checksum,
          roundNumber: round.number,
          tagIds,
        }),
      );
    } catch (error) {
      showToast({
        content: <Trans>An error occurred.</Trans>,
        id: 'update-round-tags-error',
        type: 'error',
      });
    }
  };

  const onEditClick = () => {
    showDialog(<TagsDialog onTagIdsUpdated={onTagIdsUpdated} defaultTagIds={tagIds} />);
  };

  return (
    <div className="max-w-[312px]">
      <Panel
        header={
          <div className="flex justify-between">
            <Trans context="Panel title">Tags</Trans>
            <Button onClick={onEditClick}>
              <Trans context="Button">Edit</Trans>
            </Button>
          </div>
        }
      >
        <div className="flex gap-x-8 gap-y-4 items-center flex-wrap">
          {visibleTagIds.length === 0 ? (
            <p>
              <Trans>No tags</Trans>
            </p>
          ) : (
            visibleTagIds.map((tagId) => {
              return <Tag key={tagId} id={tagId} />;
            })
          )}
          {hiddenTagIds.length > 0 && (
            <Tooltip content={<TagsTooltip tagIds={hiddenTagIds} />}>
              <div className="flex items-center justify-center bg-gray-75 rounded px-8 py-4 border border-transparent">
                <p className="text-caption">+{hiddenTagIds.length}</p>
              </div>
            </Tooltip>
          )}
        </div>
      </Panel>
    </div>
  );
}
