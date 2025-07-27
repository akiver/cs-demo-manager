import { db } from 'csdm/node/database/database';
import type { BombExploded } from '../../../common/types/bomb-exploded';
import { bombExplodedRowToBombExploded } from './bomb-exploded-row-to-bomb-exploded';

export async function fetchBombExploded(checksum: string, roundNumber: number) {
  const row = await db
    .selectFrom('bombs_exploded')
    .selectAll()
    .leftJoin('steam_account_overrides', 'bombs_exploded.planter_steam_id', 'steam_account_overrides.steam_id')
    .select([db.fn.coalesce('steam_account_overrides.name', 'bombs_exploded.planter_name').as('planter_name')])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('tick')
    .executeTakeFirst();

  let bombExploded: BombExploded | null = null;
  if (row !== undefined) {
    bombExploded = bombExplodedRowToBombExploded(row);
  }

  return bombExploded;
}
