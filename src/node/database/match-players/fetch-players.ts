import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { playerQueryResultToPlayer } from './player-query-result-to-player';
import type { Player } from 'csdm/common/types/player';
import type { PlayerQueryResult } from './player-query-result';
import { fetchCollateralKillCountPerSteamId } from '../player/fetch-collateral-kill-count-per-steam-ids';
import { fetchPlayersClutchStats } from '../clutches/fetch-players-clutch-stats';
import { fetchPlayersTagIds } from '../tags/fetch-players-tag-ids';

export async function fetchPlayers(checksum: string): Promise<Player[]> {
  const rows: PlayerQueryResult[] = await db
    .selectFrom('players')
    .selectAll('players')
    .innerJoin('matches', 'matches.checksum', 'players.match_checksum')
    .leftJoin('steam_accounts', 'steam_accounts.steam_id', 'players.steam_id')
    .select('steam_accounts.avatar')
    .leftJoin('ignored_steam_accounts', 'ignored_steam_accounts.steam_id', 'steam_accounts.steam_id')
    .select(
      // Set the last ban date column only if the steam account is not ignored and the ban occurred after the match's date.
      // The left join on the steam_accounts table preserve possible players not present in the steam_accounts table.
      sql<Date | null>`CASE WHEN steam_accounts.last_ban_date > matches.date AND ignored_steam_accounts.steam_id IS NULL THEN steam_accounts.last_ban_date END`.as(
        'last_ban_date',
      ),
    )
    .leftJoin('steam_account_overrides', 'players.steam_id', 'steam_account_overrides.steam_id')
    .select([db.fn.coalesce('steam_account_overrides.name', 'players.name').as('name')])
    .leftJoin('kills', (join) => {
      return join.on(({ and, eb, ref }) => {
        return and([
          eb('kills.killer_steam_id', '=', 'players.steam_id'),
          eb('kills.match_checksum', '=', ref('matches.checksum')),
        ]);
      });
    })
    .select(
      sql<number>`COUNT(kills.id) FILTER (WHERE kills.penetrated_objects > 0 AND kills.killer_steam_id = players.steam_id)`.as(
        'wallbang_kill_count',
      ),
    )
    .select(
      sql<number>`COUNT(kills.id) FILTER (WHERE kills.is_no_scope = true AND kills.killer_steam_id = players.steam_id)`.as(
        'no_scope_kill_count',
      ),
    )
    .where('players.match_checksum', '=', checksum)
    .groupBy([
      'players.id',
      'matches.date',
      'steam_accounts.avatar',
      'last_ban_date',
      'ignored_steam_accounts.steam_id',
      'steam_account_overrides.name',
    ])
    .execute();

  const steamIds = rows.map((row) => row.steam_id);
  const [collateralKillCountPerSteamId, playersClutchStats, tagIds] = await Promise.all([
    fetchCollateralKillCountPerSteamId(checksum),
    fetchPlayersClutchStats([checksum], steamIds),
    fetchPlayersTagIds(steamIds),
  ]);
  const players: Player[] = rows.map((row) => {
    const clutchStats = playersClutchStats.find((clutchStats) => clutchStats.clutcherSteamId === row.steam_id);

    return playerQueryResultToPlayer(row, clutchStats, collateralKillCountPerSteamId[row.steam_id] ?? 0, tagIds);
  });

  return players;
}
