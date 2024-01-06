import { sql } from 'kysely';
import { WeaponType } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { CollateralKillResult } from 'csdm/common/types/search/collateral-kill-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter;

export async function searchCollateralKills({ steamIds, mapNames, startDate, endDate, demoSources }: Filter) {
  let query = db
    .selectFrom('kills as k1')
    .selectAll('k1')
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
    .groupBy(['k1.id', 'matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .orderBy('matches.date', 'desc')
    .orderBy('k1.match_checksum')
    .orderBy('k1.killer_name')
    .orderBy('k1.tick')
    .having(sql<number>`COUNT(k1.tick)`, '>', 1);

  if (steamIds.length > 0) {
    query = query.where('k1.killer_steam_id', 'in', steamIds);
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
        date: row.date.toUTCString(),
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
