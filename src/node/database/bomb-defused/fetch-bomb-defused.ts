import { db } from 'csdm/node/database/database';
import type { BombDefused } from '../../../common/types/bomb-defused';
import { bombDefusedRowToBombDefused } from './bomb-defused-row-to-bomb-defused';

export async function fetchBombDefused(checksum: string, roundNumber: number) {
  const row = await db
    .selectFrom('bombs_defused')
    .selectAll()
    .leftJoin('steam_account_overrides', 'bombs_defused.defuser_steam_id', 'steam_account_overrides.steam_id')
    .select([db.fn.coalesce('steam_account_overrides.name', 'bombs_defused.defuser_name').as('defuser_name')])
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('tick')
    .executeTakeFirst();

  let bombDefused: BombDefused | null = null;
  if (row !== undefined) {
    bombDefused = bombDefusedRowToBombDefused(row);
  }

  return bombDefused;
}
