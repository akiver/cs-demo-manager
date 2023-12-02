import React from 'react';
import type { Ref } from 'react';

type Props = {
  leftX: number;
  color: string;
};

export const Indicator = React.forwardRef(function Indicator({ color, leftX }: Props, ref: Ref<HTMLDivElement>) {
  return (
    <div
      ref={ref}
      className="absolute w-[2px] h-full"
      style={{
        backgroundColor: color,
        left: `${leftX}px`,
      }}
    />
  );
});
