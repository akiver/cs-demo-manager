import { db } from 'csdm/node/database/database';
import type { InfernoTimeline } from 'csdm/common/types/inferno-timeline';
import { decodeInfernoPositions } from './decode-inferno-positions';

export async function fetchInfernoTimelines(checksum: string, roundNumber: number): Promise<InfernoTimeline[]> {
  const rows = await db
    .selectFrom('inferno_positions')
    .select(['unique_id', 'thrower_steam_id', 'thrower_name', 'x', 'y', 'z', 'ticks', 'convex_hulls_2d'])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();

  return rows.map(decodeInfernoPositions);
}
