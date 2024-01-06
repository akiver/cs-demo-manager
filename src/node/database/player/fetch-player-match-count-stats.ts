import { sql } from 'kysely';
import { RankingFilter } from 'csdm/common/types/ranking-filter';
import { db } from 'csdm/node/database/database';
import type { FetchPlayerFilters } from './fetch-player-filters';

function buildQuery({
  steamId,
  startDate,
  endDate,
  sources,
  games,
  ranking,
  gameModes,
  tagIds,
  maxRounds,
  demoTypes,
}: FetchPlayerFilters) {
  const { count } = db.fn;
  let query = db
    .selectFrom('matches')
    .select(count<number>('matches.checksum').as('matchCount'))
    .leftJoin('players', 'players.match_checksum', 'matches.checksum')
    .where('players.steam_id', '=', steamId);

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (ranking !== RankingFilter.All) {
    query = query.where('is_ranked', '=', ranking === RankingFilter.Ranked);
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
