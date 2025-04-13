import { db } from 'csdm/node/database/database';
import type { TeamFilters } from './team-filters';
import { applyMatchFilters } from '../match/apply-match-filters';

function buildQuery({ name, ...filters }: TeamFilters) {
  const { count } = db.fn;
  let query = db
    .selectFrom('matches')
    .select(count<number>('matches.checksum').as('matchCount'))
    .leftJoin('teams', 'teams.match_checksum', 'matches.checksum')
    .where('teams.name', '=', name);

  query = applyMatchFilters(query, filters);

  return query;
}

type PlayerMatchCountStats = {
  wonMatchCount: number;
  tiedMatchCount: number;
  lostMatchCount: number;
};

export async function fetchTeamMatchCountStats(filters: TeamFilters): Promise<PlayerMatchCountStats> {
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
