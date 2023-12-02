import { sql } from 'kysely';
import { CompetitiveRank } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import type { FetchPlayerFilters } from './fetch-player-filters';
import type { PremierRankHistory } from 'csdm/common/types/charts/premier-rank-history';

export async function fetchPlayerPremierRankHistory({
  steamId,
  startDate,
  endDate,
}: FetchPlayerFilters): Promise<PremierRankHistory[]> {
  let query = db
    .selectFrom('players')
    .select(['rank as rank', 'wins_count as winCount'])
    .innerJoin('matches', 'matches.checksum', 'players.match_checksum')
    .select(sql<string>`to_char(matches.date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as('matchDate'))
    .where('steam_id', '=', steamId)
    .where('rank', '>', CompetitiveRank.GlobalElite)
    .orderBy('date', 'asc');

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql`matches.date between ${startDate} and ${endDate}`);
  }

  const history = await query.execute();

  return history;
}
