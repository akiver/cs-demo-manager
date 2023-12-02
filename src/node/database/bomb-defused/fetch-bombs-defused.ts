import { db } from 'csdm/node/database/database';
import type { BombDefused } from '../../../common/types/bomb-defused';
import { bombDefusedRowToBombDefused } from './bomb-defused-row-to-bomb-defused';

export async function fetchBombsDefused(checksum: string) {
  const rows = await db.selectFrom('bombs_defused').selectAll().where('match_checksum', '=', checksum).execute();
  const bombsDefused: BombDefused[] = rows.map(bombDefusedRowToBombDefused);

  return bombsDefused;
}
