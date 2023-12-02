import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { ClutchResult } from 'csdm/common/types/search/clutch-result';

type Filter = SearchFilter & {
  opponentCount: 1 | 2 | 3 | 4 | 5;
};

export async function searchClutches({ opponentCount, steamIds, mapNames, startDate, endDate, demoSources }: Filter) {
  let query = db
    .selectFrom('clutches')
    .selectAll()
    .innerJoin('matches', 'clutches.match_checksum', 'matches.checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .where('opponent_count', '=', opponentCount)
    .where('won', '=', true);

  if (steamIds.length > 0) {
    query = query.where('clutcher_steam_id', 'in', steamIds);
  }

  if (mapNames.length > 0) {
    query = query.where('matches.map_name', 'in', mapNames);
  }

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql`matches.date between ${startDate} and ${endDate}`);
  }

  if (demoSources.length > 0) {
    query = query.where('matches.source', 'in', demoSources);
  }

  const rows = await query.execute();
  const clutches: ClutchResult[] = rows.map((row) => {
    return {
      ...clutchRowToClutch(row),
      mapName: row.map_name,
      date: row.date.toUTCString(),
      demoPath: row.demo_path,
      game: row.game,
    };
  });

  return clutches;
}
