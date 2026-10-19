import { db } from 'csdm/node/database/database';
import type { GrenadeTimeline } from 'csdm/common/types/grenade-timeline';
import { decodeGrenadePositions } from './decode-grenade-positions';

export async function fetchGrenadeTimelines(checksum: string, roundNumber: number): Promise<GrenadeTimeline[]> {
  const rows = await db
    .selectFrom('grenade_positions')
    .select([
      'grenade_id',
      'projectile_id',
      'grenade_name',
      'thrower_steam_id',
      'thrower_name',
      'thrower_side',
      'thrower_team_name',
      'thrower_velocity_x',
      'thrower_velocity_y',
      'thrower_velocity_z',
      'thrower_yaw',
      'thrower_pitch',
      'ticks',
      'x',
      'y',
      'z',
    ])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();

  return rows.map(decodeGrenadePositions);
}
