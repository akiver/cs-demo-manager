import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { MultiKillResult } from 'csdm/common/types/search/multi-kill-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter & {
  killCount: number;
};

export async function searchMultiKills({ killCount, steamIds, mapNames, startDate, endDate, demoSources }: Filter) {
  let query = db
    .selectFrom('kills as k1')
    .selectAll(['k1'])
    .select([sql<number>`COUNT(k1.id)`.as('killCount')])
    .innerJoin('kills as k2', function (qb) {
      return qb
        .onRef('k1.match_checksum', '=', 'k2.match_checksum')
        .onRef('k1.round_number', '=', 'k2.round_number')
        .onRef('k1.killer_steam_id', '=', 'k2.killer_steam_id');
    })
    .innerJoin('matches', 'k1.match_checksum', 'matches.checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .orderBy('matches.date', 'desc')
    .orderBy('k1.match_checksum')
    .orderBy('k1.killer_name')
    .orderBy('k1.round_number')
    .orderBy('k1.tick')
    .groupBy([
      'k1.id',
      'k1.killer_steam_id',
      'k1.killer_name',
      'k1.round_number',
      'k1.match_checksum',
      'matches.map_name',
      'matches.demo_path',
      'matches.date',
      'matches.game',
    ])
    .having(sql<number>`COUNT(k1.id)`, '=', killCount);

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

  const multiKills: MultiKillResult[] = [];
  let currentRoundNumber = 0;
  let currentMatchChecksum = '';
  for (const kill of rows) {
    if (kill.round_number !== currentRoundNumber || kill.match_checksum !== currentMatchChecksum) {
      currentRoundNumber = kill.round_number;
      currentMatchChecksum = kill.match_checksum;

      multiKills.push({
        matchChecksum: kill.match_checksum,
        demoPath: kill.demo_path,
        game: kill.game,
        id: String(kill.id),
        killerName: kill.killer_name,
        killerSteamId: kill.killer_steam_id,
        roundNumber: kill.round_number,
        tick: kill.tick,
        date: kill.date.toUTCString(),
        mapName: kill.map_name,
        side: kill.killer_side,
        kills: [killRowToKill(kill)],
      });
    } else {
      multiKills[multiKills.length - 1].kills.push(killRowToKill(kill));
    }
  }

  return multiKills;
}
