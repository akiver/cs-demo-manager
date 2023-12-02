import React from 'react';
import { useTags } from 'csdm/ui/tags/use-tags';
import { Tooltip } from './tooltip';
import { Button } from './buttons/button';
import { TagIcon } from 'csdm/ui/icons/tag-icon';
import { TagsDialog } from 'csdm/ui/dialogs/tags-dialog';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Trans } from '@lingui/macro';

function Tag(props: { id: string; checksum: string; matchTagIds: string[] }) {
  const tags = useTags();
  const tag = tags.find((tag) => tag.id === props.id);
  if (tag === undefined) {
    return null;
  }

  return (
    <div className="flex bg-gray-75 rounded border border-gray-300">
      <div
        className="w-12 rounded-l border-r"
        style={{
          backgroundColor: tag.color,
        }}
      />
      <p className="px-8 py-4 text-caption">{tag.name}</p>
    </div>
  );
}

function TagsTooltip({ tagIds, checksum }: Props) {
  return (
    <div className="flex gap-8 flex-wrap">
      {tagIds.map((tagId) => {
        return <Tag key={tagId} id={tagId} checksum={checksum} matchTagIds={tagIds} />;
      })}
    </div>
  );
}

type Props = {
  checksum: string;
  tagIds: string[];
};

export function Tags({ checksum, tagIds }: Props) {
  const visibleTagIds = tagIds.slice(0, 3);
  const hiddenTagIds = tagIds.slice(3);
  const { showDialog } = useDialog();

  return (
    <div className="flex gap-x-8 gap-y-4 items-center flex-wrap">
      <Tooltip content="Edit tags">
        <Button
          onClick={() => {
            showDialog(<TagsDialog checksums={[checksum]} defaultTagIds={tagIds} />);
          }}
        >
          <TagIcon height={14} />
        </Button>
      </Tooltip>
      {visibleTagIds.length === 0 ? (
        <p>
          <Trans>No tags</Trans>
        </p>
      ) : (
        visibleTagIds.map((tagId) => {
          return <Tag key={tagId} id={tagId} checksum={checksum} matchTagIds={tagIds} />;
        })
      )}
      {hiddenTagIds.length > 0 && (
        <Tooltip content={<TagsTooltip tagIds={hiddenTagIds} checksum={checksum} />}>
          <div className="flex items-center justify-center bg-gray-75 rounded px-8 py-4 border border-transparent">
            <p className="text-caption">+{hiddenTagIds.length}</p>
          </div>
        </Tooltip>
      )}
    </div>
  );
}
