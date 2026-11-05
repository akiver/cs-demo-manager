import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { Point } from 'csdm/common/types/point';
import { createDataView } from 'csdm/node/database/create-data-view';
import type { PlayerPositionTable } from 'csdm/node/database/player-position/player-position-table';
import { RadarLevel } from 'csdm/ui/maps/radar-level';

type PackedPositions = Pick<PlayerPositionTable, 'ticks' | 'x' | 'y' | 'z' | 'state_ticks' | 'is_alive' | 'side'>;

type Options = {
  startTick: number; // inclusive
  endTick: number | null; // inclusive, null => no upper bound
  sides: TeamNumber[]; // empty => all sides
  thresholdZ: number | null;
  radarLevel: RadarLevel;
  sampleInterval: number; // number of ticks between two kept points
};

// Extracts the heatmap points from the packed positions of one player during one round.
export function extractPositionPoints(packed: PackedPositions, options: Options): Point[] {
  const { startTick, endTick, sides, thresholdZ, radarLevel, sampleInterval } = options;
  const ticks = createDataView(packed.ticks);
  const x = createDataView(packed.x);
  const y = createDataView(packed.y);
  const z = createDataView(packed.z);
  const stateTicks = createDataView(packed.state_ticks);
  const side = createDataView(packed.side);
  const movementCount = packed.ticks.byteLength / 4;
  const stateCount = packed.state_ticks.byteLength / 4;
  const points: Point[] = [];
  let stateIndex = -1; // Index of the state applying to the current position
  let lastSampleIndex = -1;

  for (let index = 0; index < movementCount; index++) {
    const offset = index * 4;
    const tick = ticks.getInt32(offset);
    if (tick < startTick || (endTick !== null && tick > endTick)) {
      continue;
    }

    while (stateIndex + 1 < stateCount && stateTicks.getInt32((stateIndex + 1) * 4) <= tick) {
      stateIndex++;
    }
    if (stateIndex < 0) {
      continue;
    }

    const sampleIndex = Math.floor(tick / sampleInterval);
    if (sampleIndex === lastSampleIndex) {
      continue;
    }
    if (packed.is_alive[stateIndex] !== 1) {
      continue;
    }
    if (sides.length > 0 && !sides.includes(side.getInt32(stateIndex * 4) as TeamNumber)) {
      continue;
    }
    if (thresholdZ !== null) {
      const positionZ = z.getFloat32(offset);
      const isVisible = radarLevel === RadarLevel.Upper ? positionZ >= thresholdZ : positionZ < thresholdZ;
      if (!isVisible) {
        continue;
      }
    }

    points.push({
      x: x.getFloat32(offset),
      y: y.getFloat32(offset),
    });
    lastSampleIndex = sampleIndex;
  }

  return points;
}
