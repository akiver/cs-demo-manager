import React from 'react';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';

type Props = {
  tick: number;
  pixelsPerTick: number;
  backgroundColor: string;
};

export function CameraMarker({ tick, pixelsPerTick, backgroundColor }: Props) {
  const x = tick * pixelsPerTick;

  return (
    <div
      className="pointer-events-none absolute z-1 h-full w-px origin-left"
      style={{
        ...scaleStyle,
        left: `${x}px`,
        backgroundColor,
      }}
    />
  );
}
