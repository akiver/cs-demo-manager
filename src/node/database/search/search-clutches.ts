import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { clutchRowToClutch } from '../clutches/clutch-row-to-clutch';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { ClutchResult } from 'csdm/common/types/search/clutch-result';

type Filter = SearchFilter & {
  opponentCount: 1 | 2 | 3 | 4 | 5;
};

export async function searchClutches({
  opponentCount,
  steamIds,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
}: Filter) {
  let query = db
    .selectFrom('clutches')
    .selectAll('clutches')
    .distinct()
    .innerJoin('matches', 'clutches.match_checksum', 'matches.checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
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
            .onRef('matches.checksum', '=', 'round_tags.checksum')
            .onRef('clutches.round_number', '=', 'round_tags.round_number');
        })
        .where('round_tags.tag_id', 'in', roundTagIds)
        .groupBy(['round_tags.checksum', 'round_tags.round_number', 'round_tags.tag_id']);
    })
    .where('opponent_count', '=', opponentCount)
    .where('won', '=', true)
    .orderBy('matches.date', 'desc')
    .orderBy('clutches.match_checksum')
    .orderBy('clutches.round_number')
    .orderBy('clutches.tick')
    .groupBy([
      'clutches.id',
      'matches.checksum',
      'matches.map_name',
      'matches.date',
      'matches.demo_path',
      'matches.game',
    ]);

  if (steamIds.length > 0) {
    query = query.where('clutcher_steam_id', 'in', steamIds);
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
  const clutches: ClutchResult[] = rows.map((row) => {
    return {
      ...clutchRowToClutch(row),
      mapName: row.map_name,
      date: row.date.toISOString(),
      demoPath: row.demo_path,
      game: row.game,
    };
  });

  return clutches;
}
