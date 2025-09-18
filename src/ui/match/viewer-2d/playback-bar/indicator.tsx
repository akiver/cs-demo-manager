import React from 'react';
import type { Ref } from 'react';

type Props = {
  ref?: Ref<HTMLDivElement>;
  leftX: number;
  color: string;
};

export function Indicator({ ref, color, leftX }: Props) {
  return (
    <div
      ref={ref}
      className="absolute h-full w-[2px]"
      style={{
        backgroundColor: color,
        left: `${leftX}px`,
      }}
    />
  );
}
