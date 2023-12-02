import { db } from 'csdm/node/database/database';
import type { Kill } from 'csdm/common/types/kill';
import { killRowToKill } from './kill-row-to-kill';

export async function fetchKills(checksum: string, roundNumber?: number) {
  let query = db.selectFrom('kills').selectAll().where('match_checksum', '=', checksum).orderBy('frame', 'asc');

  if (typeof roundNumber === 'number') {
    query = query.where('round_number', '=', roundNumber);
  }

  const rows = await query.execute();

  const kills: Kill[] = rows.map(killRowToKill);

  return kills;
}
