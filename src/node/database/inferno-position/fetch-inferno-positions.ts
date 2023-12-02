import type { InfernoPosition } from 'csdm/common/types/inferno-position';
import { db } from 'csdm/node/database/database';
import { infernoPositionRowToInfernoPosition } from './inferno-position-row-to-inferno-position';

export async function fetchInfernoPositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('inferno_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();
  const infernoPositions: InfernoPosition[] = rows.map(infernoPositionRowToInfernoPosition);

  return infernoPositions;
}
