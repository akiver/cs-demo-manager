import { db } from 'csdm/node/database/database';
import { chickenPositionRowToChickenPosition } from './chicken-position-row-to-chicken-position';

export async function fetchChickenPositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('chicken_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('frame', 'asc')
    .execute();

  const positions = rows.map(chickenPositionRowToChickenPosition);

  return positions;
}
