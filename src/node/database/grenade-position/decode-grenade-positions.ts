import type { GrenadeTimeline } from 'csdm/common/types/grenade-timeline';
import { decodePackedPositions } from 'csdm/node/database/decode-packed-positions';
import type { GrenadePositionTable } from './grenade-position-table';

type PackedGrenadePositions = Omit<GrenadePositionTable, 'match_checksum' | 'round_number'>;

export function decodeGrenadePositions(packed: PackedGrenadePositions): GrenadeTimeline {
  return {
    grenadeId: packed.grenade_id,
    projectileId: packed.projectile_id,
    grenadeName: packed.grenade_name,
    throwerSteamId: packed.thrower_steam_id,
    throwerName: packed.thrower_name,
    throwerSide: packed.thrower_side,
    throwerTeamName: packed.thrower_team_name,
    throwerVelocityX: packed.thrower_velocity_x,
    throwerVelocityY: packed.thrower_velocity_y,
    throwerVelocityZ: packed.thrower_velocity_z,
    throwerYaw: packed.thrower_yaw,
    throwerPitch: packed.thrower_pitch,
    positions: decodePackedPositions(packed),
  };
}
