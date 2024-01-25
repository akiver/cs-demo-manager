import React from 'react';
import { Tooltip } from '../../tooltip';
import { useTags } from 'csdm/ui/tags/use-tags';
import type { CellProps } from '../table-types';
import type { ColumnID } from 'csdm/common/types/column-id';

type CircleProps = {
  top: number;
  color: string;
};

const Circle = React.forwardRef(function Circle({ color, top }: CircleProps, ref: React.Ref<HTMLDivElement>) {
  return (
    <div
      ref={ref}
      className="absolute size-8 rounded-full border"
      style={{
        top: `${top}px`,
        backgroundColor: color,
      }}
    />
  );
});

type Props = CellProps<{ tagIds: ColumnID[] }>;

export function TagsCell({ data }: Props) {
  const maxVisibleTagCount = 4;
  const yOffset = 5;
  const { tagIds } = data;
  const allTags = useTags();
  const tags = allTags
    .filter((tag) => {
      return tagIds.includes(tag.id);
    })
    .slice(0, maxVisibleTagCount);

  return (
    <div className="relative h-[32px]">
      {tags.map((tag, index) => {
        const top = index === 0 ? yOffset : index * yOffset + yOffset;
        return (
          <Tooltip content={tag.name} key={tag.id} renderInPortal={true}>
            <Circle color={tag.color} top={top} />
          </Tooltip>
        );
      })}
    </div>
  );
}
