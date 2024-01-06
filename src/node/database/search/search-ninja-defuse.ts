import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { NinjaDefuseResult } from 'csdm/common/types/search/ninja-defuse-result';
import { bombDefusedRowToBombDefused } from '../bomb-defused/bomb-defused-row-to-bomb-defused';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter;

export async function searchNinjaDefuse({ steamIds, mapNames, startDate, endDate, demoSources }: Filter) {
  let query = db
    .selectFrom('bombs_defused')
    .selectAll('bombs_defused')
    .innerJoin('matches', 'matches.checksum', 'bombs_defused.match_checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .orderBy('matches.date', 'desc')
    .orderBy('bombs_defused.match_checksum')
    .orderBy('bombs_defused.defuser_name')
    .orderBy('bombs_defused.round_number')
    .where('bombs_defused.t_alive_count', '>', 0);

  if (steamIds.length > 0) {
    query = query.where('bombs_defused.defuser_steam_id', 'in', steamIds);
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

  const bombsDefused: NinjaDefuseResult[] = rows.map((row) => {
    return {
      ...bombDefusedRowToBombDefused(row),
      mapName: row.map_name,
      date: row.date.toUTCString(),
      demoPath: row.demo_path,
      game: row.game,
    };
  });

  return bombsDefused;
}
