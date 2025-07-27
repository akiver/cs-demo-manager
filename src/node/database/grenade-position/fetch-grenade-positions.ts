import { db } from 'csdm/node/database/database';
import { grenadePositionRowToGrenadePosition } from './grenade-position-row-to-grenade-position';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';

export async function fetchGrenadePositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('grenade_positions')
    .selectAll()
    .distinctOn(['tick', 'projectile_id'])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('tick')
    .execute();
  const grenadePositions = fillMissingTicks(rows.map(grenadePositionRowToGrenadePosition));

  return grenadePositions;
}
