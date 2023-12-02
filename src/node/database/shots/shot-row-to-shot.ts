import type { Shot } from 'csdm/common/types/shot';
import type { ShotRow } from './shot-table';

export function shotRowToShot(row: ShotRow): Shot {
  return {
    id: row.id,
    frame: row.frame,
    tick: row.tick,
    roundNumber: row.round_number,
    weaponName: row.weapon_name,
    weaponId: row.weapon_id,
    projectileId: row.projectile_id,
    x: row.x,
    y: row.y,
    z: row.z,
    playerName: row.player_name,
    playerSteamId: row.player_steam_id,
    playerTeamName: row.player_team_name,
    playerSide: row.player_side,
    isPlayerControllingBot: row.is_player_controlling_bot,
    playerVelocityY: row.player_velocity_y,
    playerVelocityZ: row.player_velocity_z,
    playerVelocityX: row.player_velocity_x,
    playerYaw: row.player_yaw,
    playerPitch: row.player_pitch,
    matchChecksum: row.match_checksum,
  };
}
