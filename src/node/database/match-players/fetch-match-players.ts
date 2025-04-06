import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { fetchCollateralKillCountPerSteamId } from '../player/fetch-collateral-kill-count-per-steam-ids';
import { fetchPlayersClutchStats } from '../players/fetch-players-clutch-stats';
import { fetchPlayersTagIds } from '../tags/fetch-players-tag-ids';
import type { MatchPlayer } from 'csdm/common/types/match-player';

export async function fetchMatchPlayers(checksum: string): Promise<MatchPlayer[]> {
  const rows = await db
    .selectFrom('players')
    .select([
      'players.steam_id as steamId',
      'players.team_name as teamName',
      'players.kill_count as killCount',
      'players.assist_count as assistCount',
      'players.death_count as deathCount',
      'players.kill_death_ratio as killDeathRatio',
      'players.bomb_planted_count as bombPlantedCount',
      'players.bomb_defused_count as bombDefusedCount',
      'players.hostage_rescued_count as hostageRescuedCount',
      'players.mvp_count as mvpCount',
      'players.headshot_count as headshotCount',
      'players.headshot_percentage as headshotPercentage',
      'players.one_kill_count as oneKillCount',
      'players.two_kill_count as twoKillCount',
      'players.three_kill_count as threeKillCount',
      'players.four_kill_count as fourKillCount',
      'players.five_kill_count as fiveKillCount',
      'players.first_kill_count as firstKillCount',
      'players.first_death_count as firstDeathCount',
      'players.first_trade_kill_count as firstTradeKillCount',
      'players.first_trade_death_count as firstTradeDeathCount',
      'players.trade_kill_count as tradeKillCount',
      'players.trade_death_count as tradeDeathCount',
      'players.damage_health as damageHealth',
      'players.damage_armor as damageArmor',
      'players.utility_damage as utilityDamage',
      'players.utility_damage_per_round as averageUtilityDamagePerRound',
      'players.kast',
      'players.hltv_rating as hltvRating',
      'players.hltv_rating_2 as hltvRating2',
      'players.average_damage_per_round as averageDamagePerRound',
      'players.average_kill_per_round as averageKillsPerRound',
      'players.average_death_per_round as averageDeathsPerRound',
      'players.rank_type as rankType',
      'players.old_rank as oldRank',
      'players.rank',
      'players.wins_count as winsCount',
      'players.score',
      'players.color',
      'players.crosshair_share_code as crosshairShareCode',
    ])
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
          eb('kills.killer_steam_id', '=', ref('players.steam_id')),
          eb('kills.match_checksum', '=', ref('matches.checksum')),
        ]);
      });
    })
    .select(
      sql<number>`COUNT(kills.id) FILTER (WHERE kills.penetrated_objects > 0 AND kills.killer_steam_id = players.steam_id)`.as(
        'wallbangKillCount',
      ),
    )
    .select(
      sql<number>`COUNT(kills.id) FILTER (WHERE kills.is_no_scope = true AND kills.killer_steam_id = players.steam_id)`.as(
        'noScopeKillCount',
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

  const steamIds = rows.map((row) => row.steamId);
  const [collateralKillCountPerSteamId, playersClutchStats, tagIds] = await Promise.all([
    fetchCollateralKillCountPerSteamId(checksum),
    fetchPlayersClutchStats([checksum], steamIds),
    fetchPlayersTagIds(steamIds),
  ]);

  const players: MatchPlayer[] = rows.map((row) => {
    const clutchStats = playersClutchStats.find((clutchStats) => clutchStats.clutcherSteamId === row.steamId);

    return {
      ...row,
      collateralKillCount: collateralKillCountPerSteamId[row.steamId] ?? 0,
      lastBanDate: row.last_ban_date?.toISOString() ?? null,
      vsOneCount: clutchStats?.vsOneCount ?? 0,
      vsOneWonCount: clutchStats?.vsOneWonCount ?? 0,
      vsOneLostCount: clutchStats?.vsOneLostCount ?? 0,
      vsTwoCount: clutchStats?.vsTwoCount ?? 0,
      vsTwoWonCount: clutchStats?.vsTwoWonCount ?? 0,
      vsTwoLostCount: clutchStats?.vsTwoLostCount ?? 0,
      vsThreeCount: clutchStats?.vsThreeCount ?? 0,
      vsThreeWonCount: clutchStats?.vsThreeWonCount ?? 0,
      vsThreeLostCount: clutchStats?.vsThreeLostCount ?? 0,
      vsFourCount: clutchStats?.vsFourCount ?? 0,
      vsFourWonCount: clutchStats?.vsFourWonCount ?? 0,
      vsFourLostCount: clutchStats?.vsFourLostCount ?? 0,
      vsFiveCount: clutchStats?.vsFiveCount ?? 0,
      vsFiveWonCount: clutchStats?.vsFiveWonCount ?? 0,
      vsFiveLostCount: clutchStats?.vsFiveLostCount ?? 0,
      tagIds,
    };
  });

  return players;
}
