import { sql } from 'kysely';
import { PlayerNotFound } from '../../errors/player-not-found';
import { fetchPlayerMapsStats } from './fetch-player-maps-stats';
import { fetchPlayerMatchCountStats } from './fetch-player-match-count-stats';
import { fetchPlayerCompetitiveRankHistory } from './fetch-player-competitive-rank-history';
import { fetchPlayerChartsData } from './fetch-player-charts-data';
import { db } from 'csdm/node/database/database';
import { fetchPlayerLastMatches } from './fetch-player-last-matches';
import { fetchPlayerRoundCount } from './fetch-player-rounds-count';
import { fetchLastPlayerData } from './fetch-last-player-data';
import type { PlayerProfile } from '../../../common/types/player-profile';
import { fetchPlayerEnemyCountPerRank } from './fetch-player-enemy-count-per-rank';
import { fetchMatchesTable } from '../matches/fetch-matches-table';
import { applyPlayerFilters, type FetchPlayerFilters } from './fetch-player-filters';
import { fetchPlayerCollateralKillCount } from './fetch-player-collateral-kill-count';
import { fetchPlayerClutches } from './fetch-player-clutches';
import { fetchPlayerPremierRankHistory } from './fetch-player-premier-rank-history';
import { fetchPlayersTagIds } from '../tags/fetch-players-tag-ids';
import { fetchPlayerUtilitiesStats } from './fetch-player-utilities-stats';

function buildQuery(filters: FetchPlayerFilters) {
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
      avg<number>('headshot_percentage').as('headshotPercentage'),
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
          .where('killer_steam_id', '=', filters.steamId)
          .where('penetrated_objects', '>', 0);

        wallbangsQuery = applyPlayerFilters(wallbangsQuery, filters);

        return wallbangsQuery.as('wallbangKillCount');
      },
    ])
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .leftJoin('steam_accounts', 'steam_accounts.steam_id', 'players.steam_id')
    .select([
      'vac_ban_count as vacBanCount',
      'game_ban_count as gameBanCount',
      `last_ban_date as lastBanDate`,
      'economy_ban as economyBan',
      'has_private_profile as hasPrivateProfile',
      'is_community_banned as isCommunityBanned',
    ])
    .where('players.steam_id', '=', filters.steamId)
    .groupBy([
      'players.steam_id',
      'vacBanCount',
      'gameBanCount',
      'lastBanDate',
      'economyBan',
      'hasPrivateProfile',
      'isCommunityBanned',
    ]);

  query = applyPlayerFilters(query, filters);

  return query;
}

export async function fetchPlayer(filters: FetchPlayerFilters): Promise<PlayerProfile> {
  const query = buildQuery(filters);
  const playerRow = await query.executeTakeFirst();

  if (!playerRow) {
    throw new PlayerNotFound();
  }

  const player = {
    ...playerRow,
  } as PlayerProfile;

  const [
    lastPlayerData,
    { wonMatchCount, lostMatchCount, tiedMatchCount },
    rankHistory,
    premierRankHistory,
    chartsData,
    roundCount,
    enemyCountPerRank,
    lastMatches,
    matches,
    mapsStats,
    collateralKillCount,
    clutches,
    tagIds,
    utilitiesStats,
  ] = await Promise.all([
    fetchLastPlayerData(filters),
    fetchPlayerMatchCountStats(filters),
    fetchPlayerCompetitiveRankHistory(filters),
    fetchPlayerPremierRankHistory(filters),
    fetchPlayerChartsData(filters),
    fetchPlayerRoundCount(filters),
    fetchPlayerEnemyCountPerRank(filters),
    fetchPlayerLastMatches(filters.steamId),
    fetchMatchesTable(filters),
    fetchPlayerMapsStats(filters),
    fetchPlayerCollateralKillCount(filters),
    fetchPlayerClutches(filters),
    fetchPlayersTagIds([filters.steamId]),
    fetchPlayerUtilitiesStats(filters),
  ]);
  player.name = lastPlayerData.name;
  player.avatar = lastPlayerData.avatar;
  player.comment = lastPlayerData.comment;
  player.competitiveRank = lastPlayerData.competitiveRank;
  player.premierRank = lastPlayerData.premierRank;
  player.winsCount = lastPlayerData?.winsCount || 0;
  player.wonMatchCount = wonMatchCount;
  player.lostMatchCount = lostMatchCount;
  player.tiedMatchCount = tiedMatchCount;
  player.competitiveRankHistory = rankHistory;
  player.premierRankHistory = premierRankHistory;
  player.chartsData = chartsData;
  player.roundCount = roundCount.totalCount;
  player.roundCountAsCt = roundCount.roundCountAsCt;
  player.roundCountAsT = roundCount.roundCountAsT;
  player.enemyCountPerRank = enemyCountPerRank;
  player.lastMatches = lastMatches;
  player.matches = matches;
  player.mapsStats = mapsStats;
  player.collateralKillCount = collateralKillCount;
  player.clutches = clutches;
  player.tagIds = tagIds;
  player.averageBlindTime = utilitiesStats.averageBlindTime;
  player.averageEnemiesFlashed = utilitiesStats.averageEnemiesFlashed;
  player.averageHeGrenadeDamage = utilitiesStats.averageHeGrenadeDamage;
  player.averageSmokesThrownPerMatch = utilitiesStats.averageSmokesThrownPerMatch;

  return player;
}
