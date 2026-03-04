import { db } from 'csdm/node/database/database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';
import type { Clutch } from 'csdm/common/types/clutch';
import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';

export async function fetchPlayerClutches(steamId: string, filters?: MatchFilters): Promise<Clutch[]> {
  let query = db
    .selectFrom('clutches')
    .selectAll()
    .innerJoin('matches', 'matches.checksum', 'clutches.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .where('clutches.clutcher_steam_id', '=', steamId);

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  const rows = await query.execute();
  const clutches = rows.map(clutchRowToClutch);

  return clutches;
}
