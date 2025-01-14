import { db } from 'csdm/node/database/database';
import { applyPlayerFilters, type FetchPlayerFilters } from './fetch-player-filters';
import type { Clutch } from 'csdm/common/types/clutch';
import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';

export async function fetchPlayerClutches(filters: FetchPlayerFilters): Promise<Clutch[]> {
  let query = db
    .selectFrom('clutches')
    .selectAll()
    .leftJoin('matches', 'matches.checksum', 'clutches.match_checksum')
    .where('clutches.clutcher_steam_id', '=', filters.steamId);

  query = applyPlayerFilters(query, filters);

  const rows = await query.execute();
  const clutches = rows.map(clutchRowToClutch);

  return clutches;
}
