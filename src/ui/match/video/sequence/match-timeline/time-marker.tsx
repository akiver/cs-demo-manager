import React from 'react';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';

type Props = {
  tick: number;
  pixelsPerTick: number;
  text: string;
};

export function TimeMarker({ tick, pixelsPerTick, text }: Props) {
  const x = tick * pixelsPerTick;

  return (
    <div
      className="pointer-events-none absolute z-1 h-full w-px origin-left bg-gray-900"
      style={{
        ...scaleStyle,
        left: `${x}px`,
      }}
    >
      <p
        className="absolute bottom-0 flex h-24 w-[100px] flex-wrap items-center rounded-r bg-blue-700 pl-4 text-ellipsis text-white"
        title={text}
      >
        {text}
      </p>
    </div>
  );
}
