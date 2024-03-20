import React from 'react';
import { Trans } from '@lingui/macro';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { Button } from 'csdm/ui/components/buttons/button';
import { TagIcon } from 'csdm/ui/icons/tag-icon';
import { ChecksumsTagsDialog } from 'csdm/ui/dialogs/checksums-tags-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Tag, TagsTooltip } from 'csdm/ui/components/tags/tag';

type Props = {
  checksum: string;
  tagIds: string[];
};

export function Tags({ checksum, tagIds }: Props) {
  const visibleTagIds = tagIds.slice(0, 3);
  const hiddenTagIds = tagIds.slice(3);
  const { showDialog } = useDialog();

  const onEditClick = () => {
    showDialog(<ChecksumsTagsDialog checksums={[checksum]} defaultTagIds={tagIds} />);
  };

  return (
    <div className="flex gap-x-8 gap-y-4 items-center flex-wrap">
      <Tooltip content={<Trans>Edit tags</Trans>}>
        <Button onClick={onEditClick}>
          <TagIcon height={14} />
        </Button>
      </Tooltip>
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
  );
}
