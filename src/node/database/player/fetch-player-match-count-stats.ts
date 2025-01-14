import { db } from 'csdm/node/database/database';
import { applyPlayerFilters, type FetchPlayerFilters } from './fetch-player-filters';

function buildQuery(filters: FetchPlayerFilters) {
  const { count } = db.fn;
  let query = db
    .selectFrom('matches')
    .select(count<number>('matches.checksum').as('matchCount'))
    .leftJoin('players', 'players.match_checksum', 'matches.checksum')
    .where('players.steam_id', '=', filters.steamId);

  query = applyPlayerFilters(query, filters);

  return query;
}

type PlayerMatchCountStats = {
  wonMatchCount: number;
  tiedMatchCount: number;
  lostMatchCount: number;
};

export async function fetchPlayerMatchCountStats(filters: FetchPlayerFilters): Promise<PlayerMatchCountStats> {
  const wonMatchQuery = buildQuery(filters).whereRef('matches.winner_name', '=', 'players.team_name');

  const lostMatchQuery = buildQuery(filters)
    .where('matches.winner_name', 'is not', null)
    .whereRef('matches.winner_name', '!=', 'players.team_name');

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
