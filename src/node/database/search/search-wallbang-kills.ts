import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { WallbangKillResult } from 'csdm/common/types/search/wallbang-kill-result';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter;

export async function searchWallbangKills({
  steamIds,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
}: Filter) {
  let query = db
    .selectFrom('kills')
    .selectAll()
    .innerJoin('matches', 'kills.match_checksum', 'matches.checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .where('penetrated_objects', '>', 0)
    .$if(roundTagIds.length > 0, (qb) => {
      return qb
        .leftJoin('round_tags', function (qb) {
          return qb
            .onRef('kills.match_checksum', '=', 'round_tags.checksum')
            .onRef('kills.round_number', '=', 'round_tags.round_number');
        })
        .where('round_tags.tag_id', 'in', roundTagIds);
    });

  if (steamIds.length > 0) {
    query = query.where('killer_steam_id', 'in', steamIds);
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
  const kills: WallbangKillResult[] = rows.map((row) => {
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
