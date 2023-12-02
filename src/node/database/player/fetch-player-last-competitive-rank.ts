import { sql } from 'kysely';
import { CompetitiveRank, DemoSource } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import type { FetchPlayerFilters } from './fetch-player-filters';

export async function fetchPlayerLastCompetitiveRank({
  steamId,
  startDate,
  endDate,
}: FetchPlayerFilters): Promise<CompetitiveRank> {
  let query = db
    .selectFrom('players')
    .select(['rank'])
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .where('steam_id', '=', steamId)
    .where('source', '=', DemoSource.Valve)
    .where('players.rank', '>', CompetitiveRank.Unknown)
    .where('players.rank', '<=', CompetitiveRank.GlobalElite)
    .orderBy('matches.date', 'desc');

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql`matches.date between ${startDate} and ${endDate}`);
  }

  const row = await query.executeTakeFirst();

  return (row?.rank as CompetitiveRank) ?? CompetitiveRank.Unknown;
}
