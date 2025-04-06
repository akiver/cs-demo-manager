import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { SearchFilter } from 'csdm/common/types/search/search-filter';
import type { RoundResult } from 'csdm/common/types/search/round-result';
import { roundRowToRound } from '../rounds/round-row-to-round';

type Filter = SearchFilter;

export async function searchRounds({
  steamIds,
  mapNames,
  startDate,
  endDate,
  demoSources,
  roundTagIds,
  matchTagIds,
}: Filter) {
  let query = db
    .selectFrom('rounds')
    .selectAll('rounds')
    .distinct()
    .innerJoin('matches', 'matches.checksum', 'rounds.match_checksum')
    .select(['matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game'])
    .leftJoin('round_tags', function (qb) {
      return qb
        .onRef('round_tags.checksum', '=', 'rounds.match_checksum')
        .onRef('round_tags.round_number', '=', 'rounds.number');
    })
    .where('rounds.id', 'in', (qb) => {
      let roundTagsQuery = qb
        .selectFrom('rounds')
        .distinct()
        .select('rounds.id')
        .leftJoin('round_tags', function (qb) {
          return qb
            .onRef('round_tags.checksum', '=', 'rounds.match_checksum')
            .onRef('round_tags.round_number', '=', 'rounds.number');
        });

      if (roundTagIds.length > 0) {
        roundTagsQuery = roundTagsQuery.where('round_tags.tag_id', 'in', roundTagIds);
      }

      return roundTagsQuery;
    })
    .select(
      sql<string[] | null>`ARRAY_AGG(DISTINCT round_tags.tag_id) FILTER (WHERE round_tags.tag_id IS NOT NULL)`.as(
        'tagIds',
      ),
    )
    .$if(matchTagIds.length > 0, (qb) => {
      return qb
        .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
        .where('checksum_tags.tag_id', 'in', matchTagIds)
        .groupBy('checksum_tags.tag_id');
    })
    .$if(steamIds.length > 0, (qb) => {
      return qb
        .leftJoin('players', 'players.match_checksum', 'matches.checksum')
        .where('players.steam_id', 'in', steamIds);
    })
    .orderBy('matches.date', 'desc')
    .orderBy('rounds.match_checksum')
    .orderBy('rounds.number')
    .orderBy('rounds.start_tick')
    .groupBy(['rounds.id', 'matches.map_name', 'matches.date', 'matches.demo_path', 'matches.game']);

  if (mapNames.length > 0) {
    query = query.where('matches.map_name', 'in', mapNames);
  }

  if (startDate && endDate) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (demoSources.length > 0) {
    query = query.where('matches.source', 'in', demoSources);
  }

  const rows = await query.execute();

  const rounds: RoundResult[] = rows.map((row) => {
    return {
      ...roundRowToRound(row, row.tagIds ?? []),
      mapName: row.map_name,
      date: row.date.toISOString(),
      demoPath: row.demo_path,
      game: row.game,
    };
  });

  return rounds;
}
