import type { BombDefused } from '../../../common/types/bomb-defused';
import type { BombDefusedRow } from './bomb-defused-table';

export function bombDefusedRowToBombDefused(row: BombDefusedRow): BombDefused {
  return {
    id: row.id,
    matchChecksum: row.match_checksum,
    tick: row.tick,
    frame: row.frame,
    roundNumber: row.round_number,
    isDefuserControllingBot: row.is_defuser_controlling_bot,
    defuserName: row.defuser_name,
    defuserSteamId: row.defuser_steam_id,
    site: row.site,
    x: row.x,
    y: row.y,
    z: row.z,
    ctAliveCount: row.ct_alive_count,
    tAliveCount: row.t_alive_count,
  };
}
