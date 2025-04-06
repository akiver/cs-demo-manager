import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { NinjaDefuseResult } from 'csdm/common/types/search/ninja-defuse-result';
import { bombDefusedRowToBombDefused } from '../bomb-defused/bomb-defused-row-to-bomb-defused';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter;

export async function searchNinjaDefuse({
  steamIds,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
}: Filter) {
  let query = db
    .selectFrom('bombs_defused')
    .selectAll('bombs_defused')
    .distinct()
    .innerJoin('matches', 'matches.checksum', 'bombs_defused.match_checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .$if(matchTagIds.length > 0, (qb) => {
      return qb
        .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
        .where('checksum_tags.tag_id', 'in', matchTagIds)
        .groupBy('checksum_tags.tag_id');
    })
    .$if(roundTagIds.length > 0, (qb) => {
      return qb
        .leftJoin('round_tags', function (qb) {
          return qb
            .onRef('bombs_defused.match_checksum', '=', 'round_tags.checksum')
            .onRef('bombs_defused.round_number', '=', 'round_tags.round_number');
        })
        .where('round_tags.tag_id', 'in', roundTagIds)
        .groupBy('round_tags.tag_id');
    })
    .where('bombs_defused.t_alive_count', '>', 0)
    .orderBy('matches.date', 'desc')
    .orderBy('bombs_defused.match_checksum')
    .orderBy('bombs_defused.round_number')
    .orderBy('bombs_defused.tick')
    .groupBy(['bombs_defused.id', 'matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game']);

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
      date: row.date.toISOString(),
      demoPath: row.demo_path,
      game: row.game,
    };
  });

  return bombsDefused;
}
