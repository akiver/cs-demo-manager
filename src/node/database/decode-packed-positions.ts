import type { TimelinePosition } from 'csdm/common/types/timeline-position';
import { createDataView } from './create-data-view';

type PackedPositions = {
  ticks: Buffer;
  x: Buffer;
  y: Buffer;
  z: Buffer;
};

// Positions of an entity packed by the analyzer as big-endian binary: int32 for ticks and float32 for x, y and z.
export function decodePackedPositions(packed: PackedPositions): TimelinePosition[] {
  const ticks = createDataView(packed.ticks);
  const x = createDataView(packed.x);
  const y = createDataView(packed.y);
  const z = createDataView(packed.z);
  const count = packed.ticks.byteLength / 4;
  const positions: TimelinePosition[] = [];
  for (let index = 0; index < count; index++) {
    const offset = index * 4;
    positions.push({
      tick: ticks.getInt32(offset),
      x: x.getFloat32(offset),
      y: y.getFloat32(offset),
      z: z.getFloat32(offset),
    });
  }

  return positions;
}
