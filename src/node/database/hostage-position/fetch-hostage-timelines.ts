import { db } from 'csdm/node/database/database';
import type { HostageTimeline } from 'csdm/common/types/hostage-timeline';
import { decodeHostagePositions } from './decode-hostage-positions';

export async function fetchHostageTimelines(checksum: string, roundNumber: number): Promise<HostageTimeline[]> {
  const rows = await db
    .selectFrom('hostage_positions')
    .select(['ticks', 'x', 'y', 'z', 'state_ticks', 'states'])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();

  return rows.map(decodeHostagePositions);
}
