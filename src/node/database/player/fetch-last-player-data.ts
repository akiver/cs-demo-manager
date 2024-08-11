import { sql } from 'kysely';
import { type CompetitiveRank, type PremierRank } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import type { FetchPlayerFilters } from './fetch-player-filters';
import { fetchPlayerLastPremierRank } from './fetch-player-last-premier-rank';
import { fetchPlayerLastCompetitiveRank } from './fetch-player-last-competitive-rank';

type LastPlayerData = {
  name: string;
  avatar: string;
  comment: string;
  winsCount: number;
  competitiveRank: CompetitiveRank;
  premierRank: PremierRank;
};

export async function fetchLastPlayerData(filters: FetchPlayerFilters): Promise<LastPlayerData> {
  const { steamId, startDate, endDate, games } = filters;
  let query = db
    .selectFrom('players')
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .leftJoin('steam_account_overrides', 'players.steam_id', 'steam_account_overrides.steam_id')
    .select([db.fn.coalesce('steam_account_overrides.name', 'players.name').as('name'), 'wins_count as winsCount'])
    .where('players.steam_id', '=', steamId)
    .orderBy('date', 'desc');

  if (games.length > 0) {
    query = query.where('matches.game', 'in', games);
  }

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  const accountPromise = db
    .selectFrom('steam_accounts')
    .leftJoin('steam_account_overrides', 'steam_accounts.steam_id', 'steam_account_overrides.steam_id')
    .select([db.fn.coalesce('steam_account_overrides.name', 'steam_accounts.name').as('name'), 'avatar'])
    .where('steam_accounts.steam_id', '=', steamId)
    .executeTakeFirst();
  const lastPlayerEntryPromise = query.executeTakeFirstOrThrow();

  const commentPromise = db
    .selectFrom('player_comments')
    .select(['comment'])
    .where('steam_id', '=', steamId)
    .executeTakeFirst();

  const [account, lastPlayer, comment, premierRank, competitiveRank] = await Promise.all([
    accountPromise,
    lastPlayerEntryPromise,
    commentPromise,
    fetchPlayerLastPremierRank(filters),
    fetchPlayerLastCompetitiveRank(filters),
  ]);

  return {
    // Take the player's name from the steam accounts table which is synced with the Steam API first and fallback
    // to the last player entry if it doesn't exist.
    name: account?.name ?? lastPlayer.name,
    avatar: account?.avatar ?? '',
    winsCount: lastPlayer.winsCount,
    comment: comment?.comment ?? '',
    premierRank,
    competitiveRank,
  };
}
