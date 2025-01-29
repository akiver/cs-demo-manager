import React from 'react';
import { useTags } from 'csdm/ui/tags/use-tags';

type Props = { id: string };

export function Tag(props: Props) {
  const tags = useTags();
  const tag = tags.find((tag) => tag.id === props.id);
  if (tag === undefined) {
    return null;
  }

  return (
    <div className="flex bg-gray-75 rounded border border-gray-300">
      <div
        className="w-12 rounded-l border-r border-gray-300"
        style={{
          backgroundColor: tag.color,
        }}
      />
      <p className="px-8 py-4 text-caption">{tag.name}</p>
    </div>
  );
}

type TooltipProps = {
  tagIds: string[];
};

export function TagsTooltip({ tagIds }: TooltipProps) {
  return (
    <div className="flex gap-8 flex-wrap">
      {tagIds.map((tagId) => {
        return <Tag key={tagId} id={tagId} />;
      })}
    </div>
  );
}
