import type { BombPlanted } from '../../../common/types/bomb-planted';
import { db } from 'csdm/node/database/database';
import { bombPlantedRowToBombPlanted } from './bomb-planted-row-to-bomb-planted';

export async function fetchBombsPlanted(checksum: string) {
  const rows = await db.selectFrom('bombs_planted').selectAll().where('match_checksum', '=', checksum).execute();
  const bombsPlanted: BombPlanted[] = rows.map(bombPlantedRowToBombPlanted);

  return bombsPlanted;
}
