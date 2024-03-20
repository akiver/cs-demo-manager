import { sql } from 'kysely';
import { WeaponType } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { KillResult } from 'csdm/common/types/search/kill-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter;

export async function searchKnifeKills({ steamIds, mapNames, startDate, endDate, demoSources, roundTagIds }: Filter) {
  let query = db
    .selectFrom('kills')
    .selectAll('kills')
    .innerJoin('matches', 'matches.checksum', 'kills.match_checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .$if(roundTagIds.length > 0, (qb) => {
      return qb
        .leftJoin('round_tags', function (qb) {
          return qb
            .onRef('kills.match_checksum', '=', 'round_tags.checksum')
            .onRef('kills.round_number', '=', 'round_tags.round_number');
        })
        .where('round_tags.tag_id', 'in', roundTagIds);
    })
    .orderBy('matches.date', 'desc')
    .where('kills.weapon_type', '=', WeaponType.Melee)
    .orderBy('kills.match_checksum')
    .orderBy('kills.killer_name')
    .orderBy('kills.round_number');

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
