import { sql } from 'kysely';
import type { PremierRank } from 'csdm/common/types/counter-strike';
import { CompetitiveRank, DemoSource, Game } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import type { MatchFilters } from '../match/apply-match-filters';

export async function fetchPlayerLastPremierRank(steamId: string, filters?: MatchFilters): Promise<PremierRank> {
  let query = db
    .selectFrom('players')
    .select(['rank'])
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .where('steam_id', '=', steamId)
    .where('source', '=', DemoSource.Valve)
    .where('matches.game', '!=', Game.CSGO)
    .where('players.rank', '>', CompetitiveRank.Unknown)
    .where('players.rank', '>', CompetitiveRank.GlobalElite)
    .orderBy('matches.date', 'desc');

  if (filters && filters.startDate && filters.endDate) {
    query = query.where(sql<boolean>`matches.date between ${filters.startDate} and ${filters.endDate}`);
  }

  const row = await query.executeTakeFirst();

  return row?.rank ?? 0;
}
