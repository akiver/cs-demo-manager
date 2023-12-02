import { db } from 'csdm/node/database/database';
import { grenadePositionRowToGrenadePosition } from './grenade-position-row-to-grenade-position';

export async function fetchGrenadePositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('grenade_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();
  const grenadePositions = rows.map(grenadePositionRowToGrenadePosition);

  return grenadePositions;
}
