import { db } from 'csdm/node/database/database';
import type { BombExploded } from '../../../common/types/bomb-exploded';
import { bombExplodedRowToBombExploded } from './bomb-exploded-row-to-bomb-exploded';

export async function fetchBombsExploded(checksum: string) {
  const rows = await db.selectFrom('bombs_exploded').selectAll().where('match_checksum', '=', checksum).execute();
  const bombsExploded: BombExploded[] = rows.map(bombExplodedRowToBombExploded);

  return bombsExploded;
}
