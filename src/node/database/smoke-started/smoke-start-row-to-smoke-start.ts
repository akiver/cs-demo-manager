import type { SmokeStart } from '../../../common/types/smoke-start';
import type { SmokeStartRow } from './smoke-start-table';

export function smokeStartRowToSmokeStart(row: SmokeStartRow): SmokeStart {
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
