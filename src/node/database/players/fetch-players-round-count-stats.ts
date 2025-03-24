import { sql } from 'kysely';
import { TeamNumber } from 'csdm/common/types/counter-strike';
import { db } from '../database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';

export type PlayerRoundCountStats = {
  steamId: string;
  totalCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
};

export async function fetchPlayersRoundCountStats(
  steamIds: string[],
  filters?: MatchFilters,
): Promise<PlayerRoundCountStats[]> {
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
    .innerJoin('players', 'players.match_checksum', 'rounds.match_checksum')
    .select(['players.steam_id as steamId'])
    .where('players.steam_id', 'in', steamIds)
    .orderBy('players.steam_id')
    .groupBy('players.steam_id');

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  const rows = await query.execute();

  return rows;
}
