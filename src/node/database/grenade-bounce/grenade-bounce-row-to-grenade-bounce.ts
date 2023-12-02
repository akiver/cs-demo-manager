import type { GrenadeBounce } from 'csdm/common/types/grenade-bounce';
import type { GrenadeBounceRow } from './grenade-bounce-table';

export function grenadeBounceRowToGrenadeBounce(row: GrenadeBounceRow): GrenadeBounce {
  return {
    id: row.id,
    frame: row.frame,
    tick: row.tick,
    roundNumber: row.round_number,
    grenadeId: row.grenade_id,
    projectileId: row.projectile_id,
    grenadeName: row.grenade_name,
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
