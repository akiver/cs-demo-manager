import { sql } from 'kysely';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { db } from '../database';
import type { FetchTeamFilters } from './fetch-team-filters';

type RoundCount = {
  totalCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
};

export async function fetchTeamRoundCount({
  name,
  startDate,
  endDate,
  sources,
  games,
  gameModes,
  tagIds,
  maxRounds,
  demoTypes,
}: FetchTeamFilters): Promise<RoundCount> {
  const { count } = db.fn;
  let query = db
    .selectFrom('rounds')
    .select([
      count<number>('rounds.id').as('totalCount'),
      sql<number>`COUNT(rounds.id) FILTER (
        WHERE rounds.team_a_name = teams.name
        AND rounds.team_a_side = ${TeamNumber.CT}
        OR (
          rounds.team_b_name = teams.name
          AND rounds.team_b_side = ${TeamNumber.CT}
          )
        )`.as('roundCountAsCt'),
      sql<number>`COUNT(rounds.id) FILTER (
          WHERE rounds.team_a_name = teams.name
          AND rounds.team_a_side = ${TeamNumber.T}
          OR (
            rounds.team_b_name = teams.name
            AND rounds.team_b_side = ${TeamNumber.T}
            )
          )`.as('roundCountAsT'),
    ])
    .leftJoin('matches', 'matches.checksum', 'rounds.match_checksum')
    .leftJoin('teams', 'teams.match_checksum', 'rounds.match_checksum')
    .where((eb) => {
      return eb('teams.name', '=', name).or('teams.name', '=', name);
    });

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
      .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', tagIds);
  }

  const row = await query.executeTakeFirst();

  if (!row) {
    return {
      totalCount: 0,
      roundCountAsCt: 0,
      roundCountAsT: 0,
    };
  }

  return row;
}
