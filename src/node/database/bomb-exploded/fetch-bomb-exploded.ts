import { db } from 'csdm/node/database/database';
import type { BombExploded } from '../../../common/types/bomb-exploded';
import { bombExplodedRowToBombExploded } from './bomb-exploded-row-to-bomb-exploded';

export async function fetchBombExploded(checksum: string, roundNumber: number) {
  const row = await db
    .selectFrom('bombs_exploded')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('frame', 'asc')
    .executeTakeFirst();

  let bombExploded: BombExploded | null = null;
  if (row !== undefined) {
    bombExploded = bombExplodedRowToBombExploded(row);
  }

  return bombExploded;
}
