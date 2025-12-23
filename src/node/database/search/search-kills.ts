import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { KillResult } from 'csdm/common/types/search/kill-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { SearchEvent } from 'csdm/common/types/search/search-event';
import { TriStateFilter } from 'csdm/common/types/tri-state-filter';
import { WeaponType } from 'csdm/common/types/counter-strike';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

export type SearchKillsFilter = SearchFilter & {
  event: typeof SearchEvent.Kills;
  headshot: TriStateFilter;
  noScope: TriStateFilter;
  wallbang: TriStateFilter;
  jump: TriStateFilter;
  throughSmoke: TriStateFilter;
  teamKill: TriStateFilter;
  collateralKill: TriStateFilter;
};

export async function searchKills({
  headshot,
  noScope,
  wallbang,
  jump,
  throughSmoke,
  teamKill,
  collateralKill,
  steamIds,
  victimSteamIds,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
  weaponNames,
}: SearchKillsFilter) {
  let query = db
    .selectFrom('kills')
    .selectAll('kills')
    .distinct()
    .innerJoin('matches', 'matches.checksum', 'kills.match_checksum')
    .leftJoin('round_comments as rc', function (qb) {
      return qb.onRef('kills.match_checksum', '=', 'rc.match_checksum').onRef('kills.round_number', '=', 'rc.number');
    })
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game', 'rc.comment'])
    .$if(matchTagIds.length > 0, (qb) => {
      return qb
        .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
        .where('checksum_tags.tag_id', 'in', matchTagIds)
        .groupBy('checksum_tags.tag_id');
    })
    .$if(roundTagIds.length > 0, (qb) => {
      return qb
        .leftJoin('round_tags', (qb) => {
          return qb
            .onRef('kills.match_checksum', '=', 'round_tags.checksum')
            .onRef('kills.round_number', '=', 'round_tags.round_number');
        })
        .where('round_tags.tag_id', 'in', roundTagIds)
        .groupBy('round_tags.tag_id');
    })
    .orderBy('matches.date', 'desc')
    .orderBy('kills.match_checksum')
    .orderBy('kills.round_number')
    .orderBy('kills.tick')
    .orderBy('kills.killer_name')
    .groupBy(['kills.id', 'matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game', 'rc.comment']);

  if (weaponNames.length > 0) {
    query = query.where('kills.weapon_name', 'in', weaponNames);
  }

  if (headshot !== TriStateFilter.All) {
    query = query.where('kills.is_headshot', '=', headshot === TriStateFilter.Yes);
  }

  if (noScope !== TriStateFilter.All) {
    query = query.where('kills.is_no_scope', '=', noScope === TriStateFilter.Yes);
  }
  if (wallbang !== TriStateFilter.All) {
    if (wallbang === TriStateFilter.Yes) {
      query = query.where('kills.penetrated_objects', '>', 0);
    } else {
      query = query.where('kills.penetrated_objects', '=', 0);
    }
  }

  if (jump !== TriStateFilter.All) {
    query = query.where('kills.is_killer_airborne', '=', jump === TriStateFilter.Yes);
  }

  if (throughSmoke !== TriStateFilter.All) {
    query = query.where('kills.is_through_smoke', '=', throughSmoke === TriStateFilter.Yes);
  }

  if (teamKill !== TriStateFilter.All) {
    if (teamKill === TriStateFilter.Yes) {
      query = query.where((eb) => {
        return eb.and([
          eb('kills.killer_side', '=', eb.ref('kills.victim_side')),
          eb('kills.killer_steam_id', '<>', eb.ref('kills.victim_steam_id')),
        ]);
      });
    } else {
      query = query.where((eb) => {
        return eb('kills.killer_side', '<>', eb.ref('kills.victim_side'));
      });
    }
  }

  if (collateralKill !== TriStateFilter.All) {
    query = query
      .innerJoin('kills as k2', function (qb) {
        return qb
          .onRef('kills.tick', '=', 'k2.tick')
          .onRef('kills.match_checksum', '=', 'k2.match_checksum')
          .onRef('kills.killer_steam_id', '=', 'k2.killer_steam_id')
          .onRef('kills.killer_steam_id', '!=', 'k2.victim_steam_id')
          .on('kills.weapon_type', 'not in', [
            WeaponType.Equipment,
            WeaponType.Grenade,
            WeaponType.Unknown,
            WeaponType.World,
          ]);
      })
      .having(sql<number>`COUNT(*)`, collateralKill === TriStateFilter.Yes ? '>' : '=', 1);
  }

  if (steamIds.length > 0) {
    query = query.where('killer_steam_id', 'in', steamIds);
  }

  if (victimSteamIds.length > 0) {
    query = query.where('victim_steam_id', 'in', victimSteamIds);
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

  const result: KillResult[] = [];
  let currentTick = 0;
  let currentMatchChecksum = '';

  for (const row of rows) {
    if (row.tick !== currentTick || row.match_checksum !== currentMatchChecksum) {
      currentTick = row.tick;
      currentMatchChecksum = row.match_checksum;

      result.push({
        matchChecksum: row.match_checksum,
        demoPath: row.demo_path,
        game: row.game,
        id: String(row.id),
        killerName: row.killer_name,
        killerSteamId: row.killer_steam_id,
        roundNumber: row.round_number,
        tick: row.tick,
        date: row.date.toISOString(),
        mapName: row.map_name,
        side: row.killer_side,
        kills: [killRowToKill(row)],
        roundComment: row.comment ?? '',
      });
    } else if (result.length > 0) {
      lastArrayItem(result).kills.push(killRowToKill(row));
    }
  }

  return result;
}
