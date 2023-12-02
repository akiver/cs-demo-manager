import type { Expression, SqlBool } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { PlayerResult } from 'csdm/common/types/search/player-result';
import type { PlayersFilter } from 'csdm/common/types/search/players-filter';

export async function searchPlayers({ steamIdOrName, ignoredSteamIds }: PlayersFilter) {
  const query = db
    .selectFrom('players')
    .select(['players.steam_id', 'players.name'])
    .distinctOn(['players.steam_id'])
    .where(({ eb, or, and }) => {
      const filters: Expression<SqlBool>[] = [
        or([eb('players.steam_id', '=', steamIdOrName), eb('players.name', 'ilike', `%${steamIdOrName}%`)]),
      ];

      if (ignoredSteamIds.length > 0) {
        filters.push(eb('players.steam_id', 'not in', ignoredSteamIds));
      }

      return and(filters);
    })
    .limit(20);

  const rows = await query.execute();

  const players: PlayerResult[] = rows.map((row) => {
    return {
      name: row.name,
      steamId: row.steam_id,
    };
  });

  return players;
}
