import type { DecoyStart } from '../../../common/types/decoy-start';
import type { DecoyStartRow } from './decoy-start-table';

export function decoyStartRowToDecoyStart(row: DecoyStartRow): DecoyStart {
  return {
    id: row.id,
    frame: row.frame,
    tick: row.tick,
    roundNumber: row.round_number,
    grenadeId: row.grenade_id,
    projectileId: row.projectile_id,
    x: row.x,
    y: row.y,
    z: row.z,
    throwerSteamId: row.thrower_steam_id,
    throwerName: row.thrower_name,
    throwerSide: row.thrower_side,
    throwerTeamName: row.thrower_team_name,
    throwerVelocityX: row.thrower_velocity_x,
    throwerVelocityY: row.thrower_velocity_y,
    throwerVelocityZ: row.thrower_velocity_z,
    throwerYaw: row.thrower_yaw,
    throwerPitch: row.thrower_pitch,
    matchChecksum: row.match_checksum,
  };
}
