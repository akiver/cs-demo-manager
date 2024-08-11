import type { BombPlanted } from '../../../common/types/bomb-planted';
import { db } from 'csdm/node/database/database';
import { bombPlantedRowToBombPlanted } from './bomb-planted-row-to-bomb-planted';

export async function fetchBombPlanted(checksum: string, roundNumber: number) {
  const row = await db
    .selectFrom('bombs_planted')
    .selectAll()
    .leftJoin('steam_account_overrides', 'bombs_planted.planter_steam_id', 'steam_account_overrides.steam_id')
    .select([db.fn.coalesce('steam_account_overrides.name', 'bombs_planted.planter_name').as('planter_name')])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .executeTakeFirst();

  let bombPlanted: BombPlanted | null = null;
  if (row !== undefined) {
    bombPlanted = bombPlantedRowToBombPlanted(row);
  }

  return bombPlanted;
}
