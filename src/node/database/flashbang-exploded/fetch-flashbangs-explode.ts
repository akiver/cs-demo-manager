import { db } from 'csdm/node/database/database';
import { flashbangExplodeRowToFlashbangExplode } from './flashbang-explode-row-to-flashbang-explode';

export async function fetchFlashbangsExplode(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('flashbangs_explode')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .execute();
  const flashbangsExplode = rows.map(flashbangExplodeRowToFlashbangExplode);

  return flashbangsExplode;
}
