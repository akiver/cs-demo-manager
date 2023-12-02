import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useTags } from 'csdm/ui/tags/use-tags';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { UpdateChecksumsTagsPayload } from 'csdm/server/handlers/renderer-process/tags/update-checksums-tags-handler';
import { useDialog } from '../components/dialogs/use-dialog';
import { CloseButton } from '../components/buttons/close-button';
import { useDispatch } from '../store/use-dispatch';
import { checksumsTagsUpdated } from '../tags/tags-actions';
import { useShowToast } from '../components/toasts/use-show-toast';

type Props = {
  checksums: string[];
  defaultTagIds: string[];
};

export function TagsDialog({ checksums, defaultTagIds }: Props) {
  const client = useWebSocketClient();
  const tags = useTags();
  const dispatch = useDispatch();
  const { hideDialog } = useDialog();
  const showToast = useShowToast();
  const [selectedTags, setSelectedTags] = useState(defaultTagIds);

  const updateTagIds = async (tagIds: string[]) => {
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
        content: <Trans>An error occurred.</Trans>,
        id: 'checksums-tags-update-error',
        type: 'error',
      });
    }
  };

  return (
    <Dialog onEnterPressed={hideDialog}>
      <DialogHeader>
        <DialogTitle>
          <Trans>Tags</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="max-w-[524px] max-h-[300px] overflow-auto flex flex-wrap gap-8">
          {tags.map((tag) => {
            const isSelected = selectedTags.some((tagId) => {
              return tagId === tag.id;
            });

            return (
              <div
                key={tag.id}
                className={`flex rounded border border-gray-300 hover:text-gray-900 cursor-default ${
                  isSelected
                    ? 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-400'
                    : 'bg-gray-200 text-gray-600 border-transparent'
                }`}
                onClick={() => {
                  const newSelectedTagIds = isSelected
                    ? selectedTags.filter((id) => id !== tag.id)
                    : [...selectedTags, tag.id];
                  setSelectedTags(newSelectedTagIds);
                  updateTagIds(newSelectedTagIds);
                }}
              >
                <div
                  className="w-12 rounded-l border-r"
                  style={{
                    backgroundColor: tag.color,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
                <p className="px-8 py-4">{tag.name}</p>
              </div>
            );
          })}
        </div>
      </DialogContent>
      <DialogFooter>
        <CloseButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
