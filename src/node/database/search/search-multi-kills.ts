import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { killRowToKill } from '../kills/kill-row-to-kill';
import type { MultiKillResult } from 'csdm/common/types/search/multi-kill-result';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';

type Filter = SearchFilter & {
  killCount: number;
};

export async function searchMultiKills({
  killCount,
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
    .selectAll(['k1'])
    .select([sql<number>`COUNT(DISTINCT k1.id)`.as('killCount')])
    .distinct()
    .innerJoin('kills as k2', function (qb) {
      return qb
        .onRef('k1.match_checksum', '=', 'k2.match_checksum')
        .onRef('k1.round_number', '=', 'k2.round_number')
        .onRef('k1.killer_steam_id', '=', 'k2.killer_steam_id');
    })
    .innerJoin('matches', 'k1.match_checksum', 'matches.checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game', 'matches.tickrate'])
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
      'matches.tickrate',
    ])
    .having(sql<number>`COUNT(*)`, '=', killCount);

  if (steamIds.length > 0) {
    query = query.where('k1.killer_steam_id', 'in', steamIds);
  }

  if (victimSteamIds.length > 0) {
    query = query.where((eb) => {
      return eb.exists(
        eb
          .selectFrom('kills as kv')
          .select('kv.id')
          .whereRef('kv.match_checksum', '=', 'k1.match_checksum')
          .whereRef('kv.round_number', '=', 'k1.round_number')
          .whereRef('kv.killer_steam_id', '=', 'k1.killer_steam_id')
          .where('kv.victim_steam_id', 'in', victimSteamIds),
      );
    });
  }

  if (weaponNames.length > 0) {
    query = query.where((eb) => {
      return eb.exists(
        eb
          .selectFrom('kills as kw')
          .select('kw.id')
          .whereRef('kw.match_checksum', '=', 'k1.match_checksum')
          .whereRef('kw.round_number', '=', 'k1.round_number')
          .whereRef('kw.killer_steam_id', '=', 'k1.killer_steam_id')
          .where('kw.weapon_name', 'in', weaponNames),
      );
    });
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
        matchTickrate: kill.tickrate,
        demoPath: kill.demo_path,
        game: kill.game,
        id: String(kill.id),
        killerName: kill.killer_name,
        killerSteamId: kill.killer_steam_id,
        roundNumber: kill.round_number,
        tick: kill.tick,
        date: kill.date.toISOString(),
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
