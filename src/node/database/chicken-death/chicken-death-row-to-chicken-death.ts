import type { ChickenDeathRow } from './chicken-death-table';
import type { ChickenDeath } from '../../../common/types/chicken-death';

export function chickenDeathRowToChickenDeath(row: ChickenDeathRow): ChickenDeath {
  return {
    id: row.id,
    frame: row.frame,
    tick: row.tick,
    matchChecksum: row.match_checksum,
    roundNumber: row.round_number,
    killerSteamId: row.killer_steam_id,
    weaponName: row.weapon_name,
  };
}
