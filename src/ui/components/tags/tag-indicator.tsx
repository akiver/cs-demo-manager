import React from 'react';
import { Tooltip } from '../tooltip';
import type { Tag } from 'csdm/common/types/tag';

type CircleProps = {
  color: string;
  top?: number;
};

const Circle = React.forwardRef(function Circle({ color, top }: CircleProps, ref: React.Ref<HTMLDivElement>) {
  return (
    <div
      ref={ref}
      className="size-8 rounded-full border"
      style={{
        position: top ? 'absolute' : 'relative',
        top: top ? `${top}px` : undefined,
        backgroundColor: color,
      }}
    />
  );
});

type Props = {
  tag: Tag;
  top?: number;
};

export function TagIndicator({ tag, top }: Props) {
  return (
    <Tooltip content={tag.name} key={tag.id} renderInPortal={true}>
      <Circle color={tag.color} top={top} />
    </Tooltip>
  );
}
