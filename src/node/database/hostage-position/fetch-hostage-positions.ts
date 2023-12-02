import { db } from 'csdm/node/database/database';
import { hostagePositionRowToHostagePosition } from './hostage-position-row-to-hostage-position';

export async function fetchHostagePositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('hostage_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('frame', 'asc')
    .execute();

  const positions = rows.map(hostagePositionRowToHostagePosition);

  return positions;
}
