import { db } from 'csdm/node/database/database';
import type { BombDefused } from '../../../common/types/bomb-defused';
import { bombDefusedRowToBombDefused } from './bomb-defused-row-to-bomb-defused';

export async function fetchBombDefused(checksum: string, roundNumber: number) {
  const row = await db
    .selectFrom('bombs_defused')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('frame', 'asc')
    .executeTakeFirst();

  let bombDefused: BombDefused | null = null;
  if (row !== undefined) {
    bombDefused = bombDefusedRowToBombDefused(row);
  }

  return bombDefused;
}
