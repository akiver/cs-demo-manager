import type { HostagePickedUp } from '../../../common/types/hostage-picked-up';
import type { HostagePickedUpRow } from './hostage-picked-up-table';

export function hostagePickedUpRowToHostagePickedUp(row: HostagePickedUpRow): HostagePickedUp {
  return {
    id: row.id,
    frame: row.frame,
    matchChecksum: row.match_checksum,
    roundNumber: row.round_number,
    playerSteamId: row.player_steam_id,
    isPlayerControllingBot: row.is_player_controlling_bot,
    hostageEntityId: row.hostage_entity_id,
    tick: row.tick,
    x: row.x,
    y: row.y,
    z: row.z,
  };
}
