import type { InfernoPosition } from '../../../common/types/inferno-position';
import type { InfernoPositionRow } from './inferno-position-table';

export function infernoPositionRowToInfernoPosition(row: InfernoPositionRow): InfernoPosition {
  return {
    id: row.id,
    matchChecksum: row.match_checksum,
    tick: row.tick,
    frame: row.frame,
    roundNumber: row.round_number,
    throwerSteamId: row.thrower_steam_id,
    uniqueId: row.unique_id,
    x: row.x,
    y: row.y,
    z: row.z,
    convexHell2D: row.convex_hull_2d.split(',').map(Number),
  };
}
