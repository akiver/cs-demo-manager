import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { FetchTeamFilters } from './fetch-team-filters';

function buildQuery({
  name,
  startDate,
  endDate,
  sources,
  games,
  gameModes,
  tagIds,
  maxRounds,
  demoTypes,
}: FetchTeamFilters) {
  const { count } = db.fn;
  let query = db
    .selectFrom('matches')
    .select(count<number>('matches.checksum').as('matchCount'))
    .leftJoin('teams', 'teams.match_checksum', 'matches.checksum')
    .where('teams.name', '=', name);

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (sources.length > 0) {
    query = query.where('source', 'in', sources);
  }

  if (games.length > 0) {
    query = query.where('game', 'in', games);
  }

  if (demoTypes.length > 0) {
    query = query.where('type', 'in', demoTypes);
  }

  if (gameModes.length > 0) {
    query = query.where('game_mode_str', 'in', gameModes);
  }

  if (maxRounds.length > 0) {
    query = query.where('max_rounds', 'in', maxRounds);
  }

  if (tagIds.length > 0) {
    query = query
      .innerJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', tagIds);
  }

  return query;
}

type PlayerMatchCountStats = {
  wonMatchCount: number;
  tiedMatchCount: number;
  lostMatchCount: number;
};

export async function fetchTeamMatchCountStats(filters: FetchTeamFilters): Promise<PlayerMatchCountStats> {
  const wonMatchQuery = buildQuery(filters).whereRef('matches.winner_name', '=', 'teams.name');

  const lostMatchQuery = buildQuery(filters)
    .where('matches.winner_name', 'is not', null)
    .whereRef('matches.winner_name', '!=', 'teams.name');

  const tiedMatchQuery = buildQuery(filters).where('matches.winner_name', 'is', null);

  const [wonMatchResult, lostMatchResult, tiedMatchResult] = await Promise.all([
    wonMatchQuery.executeTakeFirst(),
    lostMatchQuery.executeTakeFirst(),
    tiedMatchQuery.executeTakeFirst(),
  ]);

  return {
    wonMatchCount: wonMatchResult?.matchCount ?? 0,
    lostMatchCount: lostMatchResult?.matchCount ?? 0,
    tiedMatchCount: tiedMatchResult?.matchCount ?? 0,
  };
}
