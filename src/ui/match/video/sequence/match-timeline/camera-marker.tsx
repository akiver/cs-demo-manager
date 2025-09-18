import React from 'react';
import { scaleStyle } from 'csdm/ui/components/timeline/use-timeline';
import { getSequencePlayerColor } from '../get-sequence-player-color';

type Props = {
  tick: number;
  pixelsPerTick: number;
  playerIndex: number;
};

export function CameraMarker({ tick, pixelsPerTick, playerIndex }: Props) {
  const x = tick * pixelsPerTick;

  return (
    <div
      className="pointer-events-none absolute z-1 h-full w-px origin-left"
      style={{
        ...scaleStyle,
        left: `${x}px`,
        backgroundColor: getSequencePlayerColor(playerIndex),
      }}
    />
  );
}
