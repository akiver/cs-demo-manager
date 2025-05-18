import { sql } from 'kysely';
import { TeamLetter } from 'csdm/common/types/counter-strike';
import { db } from '../database';
import { applyMatchFilters } from '../match/apply-match-filters';
import type { TeamMatchSideStats } from 'csdm/common/types/team-match-side-stats';
import type { TeamFilters } from './team-filters';

export async function fetchTeamMatchSideStats(filters: TeamFilters): Promise<TeamMatchSideStats> {
  let query = db
    .selectFrom('teams')
    .leftJoin('matches', 'matches.checksum', 'teams.match_checksum')
    .select((eb) => [
      eb.fn.count<number>('matches.checksum').as('matchCount'),
      sql<number>`COUNT(CASE WHEN teams.letter = ${TeamLetter.A} THEN 1 END)`.as('matchCountStartedAsCt'),
      sql<number>`COUNT(CASE WHEN teams.letter = ${TeamLetter.A} AND matches.winner_name = teams.name THEN 1 END)`.as(
        'matchWonCountStartedAsCt',
      ),
      sql<number>`COUNT(CASE WHEN teams.letter = ${TeamLetter.A} AND matches.winner_name IS NULL THEN 1 END)`.as(
        'matchTieCountStartedAsCt',
      ),
      sql<number>`COUNT(CASE WHEN teams.letter = ${TeamLetter.B} THEN 1 END)`.as('matchCountStartedAsT'),
      sql<number>`COUNT(CASE WHEN teams.letter = ${TeamLetter.B} AND matches.winner_name = teams.name THEN 1 END)`.as(
        'matchWonCountStartedAsT',
      ),
      sql<number>`COUNT(CASE WHEN teams.letter = ${TeamLetter.B} AND matches.winner_name IS NULL THEN 1 END)`.as(
        'matchTieCountStartedAsT',
      ),
    ])
    .where('teams.name', '=', filters.name);

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  const row = await query.executeTakeFirstOrThrow();

  return row;
}
