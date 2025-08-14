import { sql } from 'kysely';
import { WeaponType } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { CollateralKillResult } from 'csdm/common/types/search/collateral-kill-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter;

export async function searchCollateralKills({
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
    .selectFrom('kills as k1')
    .selectAll('k1')
    .distinct()
    .innerJoin('kills as k2', function (qb) {
      return qb
        .onRef('k1.tick', '=', 'k2.tick')
        .onRef('k1.match_checksum', '=', 'k2.match_checksum')
        .onRef('k1.killer_steam_id', '=', 'k2.killer_steam_id')
        .on('k1.weapon_type', 'not in', [
          WeaponType.Equipment,
          WeaponType.Grenade,
          WeaponType.Unknown,
          WeaponType.World,
        ]);
    })
    .innerJoin('matches', 'matches.checksum', 'k1.match_checksum')
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
            .onRef('k1.match_checksum', '=', 'round_tags.checksum')
            .onRef('k1.round_number', '=', 'round_tags.round_number');
        })
        .where('round_tags.tag_id', 'in', roundTagIds)
        .groupBy('round_tags.tag_id');
    })
    .groupBy(['k1.id', 'matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .orderBy('matches.date', 'desc')
    .orderBy('k1.match_checksum')
    .orderBy('k1.round_number')
    .orderBy('k1.tick')
    .orderBy('k1.killer_name')
    .having(sql<number>`COUNT(*)`, '>', 1);

  if (steamIds.length > 0) {
    query = query.where('k1.killer_steam_id', 'in', steamIds);
  }

  if (victimSteamIds.length > 0) {
    query = query.where((eb) => {
      return eb.exists(
        eb
          .selectFrom('kills as victim_filter')
          .select('victim_filter.id')
          .whereRef('victim_filter.match_checksum', '=', 'k1.match_checksum')
          .whereRef('victim_filter.tick', '=', 'k1.tick')
          .whereRef('victim_filter.killer_steam_id', '=', 'k1.killer_steam_id')
          .where('victim_filter.victim_steam_id', 'in', victimSteamIds),
      );
    });
  }

  if (weaponNames.length > 0) {
    query = query.where('k1.weapon_name', 'in', weaponNames);
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

  const kills: CollateralKillResult[] = [];
  let currentTick = 0;
  let currentMatchChecksum = '';

  for (const row of rows) {
    if (row.tick !== currentTick || row.match_checksum !== currentMatchChecksum) {
      currentTick = row.tick;
      currentMatchChecksum = row.match_checksum;

      kills.push({
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
      });
    } else {
      kills[kills.length - 1].kills.push(killRowToKill(row));
    }
  }

  return kills;
}
