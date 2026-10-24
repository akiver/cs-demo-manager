import type { InfernoTimeline } from 'csdm/common/types/inferno-timeline';
import { createDataView } from 'csdm/node/database/create-data-view';
import type { InfernoPositionTable } from './inferno-position-table';

type PackedInfernoPositions = Omit<InfernoPositionTable, 'match_checksum' | 'round_number'>;

export function decodeInfernoPositions(packed: PackedInfernoPositions): InfernoTimeline {
  const ticks = createDataView(packed.ticks);
  const convexHulls: InfernoTimeline['convexHulls'] = [];
  for (let index = 0; index < packed.convex_hulls_2d.length; index++) {
    const convexHull = packed.convex_hulls_2d[index];
    convexHulls.push({
      tick: ticks.getInt32(index * 4),
      points: convexHull === '' ? [] : convexHull.split(',').map(Number),
    });
  }

  return {
    uniqueId: packed.unique_id,
    throwerSteamId: packed.thrower_steam_id,
    throwerName: packed.thrower_name,
    x: packed.x,
    y: packed.y,
    z: packed.z,
    convexHulls,
  };
}
