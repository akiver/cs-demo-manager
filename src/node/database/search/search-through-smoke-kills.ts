import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { ThroughSmokeKillResult } from 'csdm/common/types/search/through-smoke-kill-result';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter;

export async function searchThroughSmokeKills({
  steamIds,
  victimSteamIds,
  weaponNames,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
}: Filter) {
  let query = db
    .selectFrom('kills')
    .selectAll('kills')
    .distinct()
    .innerJoin('matches', 'kills.match_checksum', 'matches.checksum')
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
            .onRef('kills.match_checksum', '=', 'round_tags.checksum')
            .onRef('kills.round_number', '=', 'round_tags.round_number');
        })
        .where('round_tags.tag_id', 'in', roundTagIds)
        .groupBy('round_tags.tag_id');
    })
    .where('is_through_smoke', '=', true)
    .orderBy('matches.date', 'desc')
    .orderBy('kills.match_checksum')
    .orderBy('kills.round_number')
    .orderBy('kills.tick')
    .orderBy('kills.killer_name')
    .groupBy(['kills.id', 'matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game']);

  if (steamIds.length > 0) {
    query = query.where('killer_steam_id', 'in', steamIds);
  }

  if (victimSteamIds.length > 0) {
    query = query.where('victim_steam_id', 'in', victimSteamIds);
  }

  if (weaponNames.length > 0) {
    query = query.where('kills.weapon_name', 'in', weaponNames);
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
  const kills: ThroughSmokeKillResult[] = rows.map((row) => {
    return {
      ...killRowToKill(row),
      mapName: row.map_name,
      date: row.date.toISOString(),
      demoPath: row.demo_path,
      game: row.game,
    };
  });

  return kills;
}
