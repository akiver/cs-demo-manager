import { db } from 'csdm/node/database/database';
import type { ChickenTimeline } from 'csdm/common/types/chicken-timeline';
import { decodePackedPositions } from 'csdm/node/database/decode-packed-positions';

export async function fetchChickenTimelines(checksum: string, roundNumber: number): Promise<ChickenTimeline[]> {
  const rows = await db
    .selectFrom('chicken_positions')
    .select(['ticks', 'x', 'y', 'z'])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();

  return rows.map((row) => {
    return {
      positions: decodePackedPositions(row),
    };
  });
}
