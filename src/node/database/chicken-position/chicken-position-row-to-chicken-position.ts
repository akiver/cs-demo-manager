import type { ChickenPosition } from '../../../common/types/chicken-position';
import type { ChickenPositionRow } from './chicken-position-table';

export function chickenPositionRowToChickenPosition(row: ChickenPositionRow): ChickenPosition {
  return {
    id: row.id,
    frame: row.frame,
    matchChecksum: row.match_checksum,
    roundNumber: row.round_number,
    tick: row.tick,
    x: row.x,
    y: row.y,
    z: row.z,
  };
}
