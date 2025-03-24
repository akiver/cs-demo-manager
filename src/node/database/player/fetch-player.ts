import { sql } from 'kysely';
import { PlayerNotFound } from '../../errors/player-not-found';
import { fetchPlayerMatchCountStats } from './fetch-player-match-count-stats';
import { db } from 'csdm/node/database/database';
import { fetchPlayerRoundCountStats } from './fetch-player-round-count-stats';
import { fetchLastPlayerData } from './fetch-last-player-data';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';
import { fetchPlayerCollateralKillCount } from './fetch-player-collateral-kill-count';
import { fetchPlayerUtilityStats } from './fetch-player-utility-stats';
import { fetchPlayerOpeningDuelsStats } from './fetch-player-opening-duels-stats';
import { EconomyBan } from 'csdm/node/steam-web-api/steam-constants';
import type { Player } from 'csdm/common/types/player';

async function fetchPlayerRow(steamId: string, filters?: MatchFilters) {
  const { count, avg, sum } = db.fn;

  let query = db
    .selectFrom('players')
    .select([
      'players.steam_id as steamId',
      count<number>('players.match_checksum').as('matchCount'),
      sum<number>('players.kill_count').as('killCount'),
      sum<number>('players.death_count').as('deathCount'),
      sum<number>('players.assist_count').as('assistCount'),
      sum<number>('players.headshot_count').as('headshotCount'),
      sum<number>('one_kill_count').as('oneKillCount'),
      sum<number>('two_kill_count').as('twoKillCount'),
      sum<number>('three_kill_count').as('threeKillCount'),
      sum<number>('four_kill_count').as('fourKillCount'),
      sum<number>('five_kill_count').as('fiveKillCount'),
      sum<number>('bomb_planted_count').as('bombPlantedCount'),
      sum<number>('bomb_defused_count').as('bombDefusedCount'),
      sum<number>('mvp_count').as('mvpCount'),
      sum<number>('first_kill_count').as('firstKillCount'),
      sum<number>('first_death_count').as('firstDeathCount'),
      sum<number>('first_trade_kill_count').as('firstTradeKillCount'),
      sum<number>('first_trade_death_count').as('firstTradeDeathCount'),
      sum<number>('trade_kill_count').as('tradeKillCount'),
      sum<number>('trade_death_count').as('tradeDeathCount'),
      sum<number>('damage_health').as('damageHealth'),
      sum<number>('damage_armor').as('damageArmor'),
      sum<number>('utility_damage').as('utilityDamage'),
      avg<number>('headshot_percentage').as('headshotPercentage'),
      sql<number>`ROUND(AVG(utility_damage_per_round)::numeric, 1)`.as('averageUtilityDamagePerRound'),
      avg<number>('kast').as('kast'),
      sql<number>`SUM(players.kill_count)::NUMERIC / NULLIF(SUM(players.death_count), 0)::NUMERIC`.as('killDeathRatio'),
      avg<number>('hltv_rating').as('hltvRating'),
      avg<number>('hltv_rating_2').as('hltvRating2'),
      avg<number>('average_damage_per_round').as('averageDamagePerRound'),
      avg<number>('average_kill_per_round').as('averageKillsPerRound'),
      avg<number>('average_death_per_round').as('averageDeathsPerRound'),
      sum<number>('hostage_rescued_count').as('hostageRescuedCount'),
      (qb) => {
        let wallbangsQuery = qb
          .selectFrom('kills')
          .select(count<number>('kills.id').as('wallbangKillCount'))
          .leftJoin('matches', 'matches.checksum', 'kills.match_checksum')
          .where('killer_steam_id', '=', steamId)
          .where('penetrated_objects', '>', 0);

        if (filters) {
          wallbangsQuery = applyMatchFilters(wallbangsQuery, filters);
        }

        return wallbangsQuery.as('wallbangKillCount');
      },
    ])
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .leftJoin('steam_accounts', 'steam_accounts.steam_id', 'players.steam_id')
    .select([
      'vac_ban_count as vacBanCount',
      'game_ban_count as gameBanCount',
      'last_ban_date as lastBanDate',
      'economy_ban as economyBan',
      'has_private_profile as hasPrivateProfile',
      'is_community_banned as isCommunityBanned',
    ])
    .where('players.steam_id', '=', steamId)
    .groupBy([
      'players.steam_id',
      'vacBanCount',
      'gameBanCount',
      'lastBanDate',
      'economyBan',
      'hasPrivateProfile',
      'isCommunityBanned',
    ]);

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  const row = await query.executeTakeFirst();

  if (!row) {
    throw new PlayerNotFound();
  }

  return row;
}

export async function fetchPlayer(steamId: string, filters?: MatchFilters): Promise<Player> {
  const [
    playerRow,
    lastPlayerData,
    matchCountStats,
    roundCount,
    collateralKillCount,
    utilitiesStats,
    openingDuelsStats,
  ] = await Promise.all([
    fetchPlayerRow(steamId, filters),
    fetchLastPlayerData(steamId, filters),
    fetchPlayerMatchCountStats(steamId, filters),
    fetchPlayerRoundCountStats(steamId, filters),
    fetchPlayerCollateralKillCount(steamId, filters),
    fetchPlayerUtilityStats(steamId, filters),
    fetchPlayerOpeningDuelsStats(steamId, filters),
  ]);

  const player: Player = {
    ...playerRow,
    ...lastPlayerData,
    ...matchCountStats,
    ...roundCount,
    ...utilitiesStats,
    roundCount: roundCount.totalCount,
    collateralKillCount,
    wallbangKillCount: playerRow.wallbangKillCount ?? 0,
    vacBanCount: playerRow.vacBanCount ?? 0,
    gameBanCount: playerRow.gameBanCount ?? 0,
    economyBan: playerRow.economyBan ?? EconomyBan.None,
    hasPrivateProfile: playerRow.hasPrivateProfile ?? false,
    isCommunityBanned: playerRow.isCommunityBanned ?? false,
    lastBanDate: playerRow.lastBanDate?.toISOString() ?? null,
    openingDuelsStats: openingDuelsStats.all,
  };

  return player;
}
