import { db } from 'csdm/node/database/database';
import type { Kill } from 'csdm/common/types/kill';
import { killRowToKill } from './kill-row-to-kill';

export async function fetchKills(checksum: string, roundNumber?: number) {
  let query = db
    .selectFrom('kills')
    .selectAll()
    .leftJoin('steam_account_overrides as killer', 'kills.killer_steam_id', 'killer.steam_id')
    .select((eb) => {
      return eb.fn.coalesce('killer.name', 'kills.killer_name').as('killer_name');
    })
    .leftJoin('steam_account_overrides as victim', 'kills.victim_steam_id', 'victim.steam_id')
    .select((eb) => {
      return eb.fn.coalesce('victim.name', 'kills.victim_name').as('victim_name');
    })
    .leftJoin('steam_account_overrides as assister', 'kills.assister_steam_id', 'assister.steam_id')
    .select((eb) => {
      return eb.fn.coalesce('assister.name', 'kills.assister_name').as('assister_name');
    })
    .where('match_checksum', '=', checksum)
    .orderBy('tick');

  if (typeof roundNumber === 'number') {
    query = query.where('round_number', '=', roundNumber);
  }

  const rows = await query.execute();

  const kills: Kill[] = rows.map(killRowToKill);

  return kills;
}
