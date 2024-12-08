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
      className="absolute w-px h-full bg-gray-900 z-1 origin-left pointer-events-none"
      style={{
        ...scaleStyle,
        left: `${x}px`,
      }}
    >
      <p
        className="absolute pl-4 bottom-0 w-[100px] h-24 flex items-center flex-wrap bg-blue-700 rounded-r text-ellipsis text-white"
        title={text}
      >
        {text}
      </p>
    </div>
  );
}
