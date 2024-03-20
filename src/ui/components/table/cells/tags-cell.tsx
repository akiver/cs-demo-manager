import React from 'react';
import { useTags } from 'csdm/ui/tags/use-tags';
import type { CellProps } from '../table-types';
import type { ColumnID } from 'csdm/common/types/column-id';
import { TagIndicator } from 'csdm/ui/components/tags/tag-indicator';

type Props = CellProps<{ tagIds: ColumnID[] }>;

export function TagsCell({ data }: Props) {
  const maxVisibleTagCount = 4;
  const yOffset = 5;
  const allTags = useTags();
  const tags = allTags
    .filter((tag) => {
      return data.tagIds.includes(tag.id);
    })
    .slice(0, maxVisibleTagCount);

  return (
    <div className="relative h-32">
      {tags.map((tag, index) => {
        const top = index === 0 ? yOffset : index * yOffset + yOffset;
        return <TagIndicator key={tag.id} tag={tag} top={top} />;
      })}
    </div>
  );
}
