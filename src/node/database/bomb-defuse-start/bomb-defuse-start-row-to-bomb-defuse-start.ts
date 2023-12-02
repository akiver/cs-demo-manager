import type { BombDefuseStart } from 'csdm/common/types/bomb-defuse-start';
import type { BombDefuseStartRow } from './bomb-defuse-start-table';

export function bombDefuseStartRowToBombDefuseStart(row: BombDefuseStartRow): BombDefuseStart {
  return {
    id: row.id,
    matchChecksum: row.match_checksum,
    tick: row.tick,
    frame: row.frame,
    roundNumber: row.round_number,
    isDefuserControllingBot: row.is_defuser_controlling_bot,
    defuserName: row.defuser_name,
    defuserSteamId: row.defuser_steam_id,
    x: row.x,
    y: row.y,
    z: row.z,
  };
}
