import type { HostagePickUpStart } from '../../../common/types/hostage-pick-up-start';
import type { HostagePickUpStartRow } from './hostage-pick-up-start-table';

export function hostagePickUpStartRowToHostagePickUpStart(row: HostagePickUpStartRow): HostagePickUpStart {
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
