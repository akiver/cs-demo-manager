import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { KillResult } from 'csdm/common/types/search/kill-result';

type Filter = SearchFilter;

export async function searchJumpKills({ steamIds, mapNames, startDate, endDate, demoSources }: Filter) {
  let query = db
    .selectFrom('kills')
    .selectAll('kills')
    .innerJoin('matches', 'matches.checksum', 'kills.match_checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .orderBy('matches.date', 'desc')
    .orderBy('kills.match_checksum')
    .orderBy('kills.killer_name')
    .orderBy('kills.round_number')
    .where('kills.is_killer_airborne', '=', true);

  if (steamIds.length > 0) {
    query = query.where('kills.killer_steam_id', 'in', steamIds);
  }

  if (mapNames.length > 0) {
    query = query.where('matches.map_name', 'in', mapNames);
  }

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (demoSources.length > 0) {
    query = query.where('matches.source', 'in', demoSources);
  }

  const rows = await query.execute();

  const kills: KillResult[] = rows.map((row) => {
    return {
      ...killRowToKill(row),
      mapName: row.map_name,
      date: row.date.toUTCString(),
      demoPath: row.demo_path,
      game: row.game,
    };
  });

  return kills;
}
