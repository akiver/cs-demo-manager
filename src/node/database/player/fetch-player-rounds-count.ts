import { sql } from 'kysely';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { applyPlayerFilters, type FetchPlayerFilters } from './fetch-player-filters';
import { db } from '../database';

type RoundCount = {
  totalCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
};

export async function fetchPlayerRoundCount(filters: FetchPlayerFilters): Promise<RoundCount> {
  const { count } = db.fn;
  let query = db
    .selectFrom('rounds')
    .select([
      count<number>('rounds.id').as('totalCount'),
      sql<number>`COUNT(rounds.id) FILTER (
        WHERE rounds.team_a_name = players.team_name
        AND rounds.team_a_side = ${TeamNumber.CT}
        OR (
          rounds.team_b_name = players.team_name
          AND rounds.team_b_side = ${TeamNumber.CT}
          )
        )`.as('roundCountAsCt'),
      sql<number>`COUNT(rounds.id) FILTER (
          WHERE rounds.team_a_name = players.team_name
          AND rounds.team_a_side = ${TeamNumber.T}
          OR (
            rounds.team_b_name = players.team_name
            AND rounds.team_b_side = ${TeamNumber.T}
            )
          )`.as('roundCountAsT'),
    ])
    .leftJoin('matches', 'matches.checksum', 'rounds.match_checksum')
    .leftJoin('players', 'players.match_checksum', 'rounds.match_checksum')
    .where('players.steam_id', '=', filters.steamId);

  query = applyPlayerFilters(query, filters);

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
