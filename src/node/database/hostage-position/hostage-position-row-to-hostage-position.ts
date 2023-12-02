import type { HostagePosition } from '../../../common/types/hostage-position';
import type { HostagePositionRow } from './hostage-position-table';

export function hostagePositionRowToHostagePosition(row: HostagePositionRow): HostagePosition {
  return {
    id: row.id,
    frame: row.frame,
    matchChecksum: row.match_checksum,
    roundNumber: row.round_number,
    state: row.state,
    tick: row.tick,
    x: row.x,
    y: row.y,
    z: row.z,
  };
}
