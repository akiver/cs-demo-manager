import { db } from 'csdm/node/database/database';
import { hostagePositionRowToHostagePosition } from './hostage-position-row-to-hostage-position';
import { fillMissingTicks } from 'csdm/common/array/fill-missing-ticks';

export async function fetchHostagePositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('hostage_positions')
    .selectAll()
    .distinctOn(['tick', 'x', 'y', 'z'])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('tick')
    .execute();

  const positions = fillMissingTicks(rows.map(hostagePositionRowToHostagePosition));

  return positions;
}
