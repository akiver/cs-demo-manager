import { sql } from 'kysely';
import type { Rank } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { fetchPlayersClutchStats } from '../players/fetch-players-clutch-stats';
import { fetchLastPlayersData } from '../players/fetch-last-players-data';

type PlayerQueryResult = {
  steamId: string;
  teamName: string;
  matchCount: number;
  killCount: number;
  assistCount: number;
  deathCount: number;
  killDeathRatio: number;
  headshotCount: number;
  headshotPercentage: number;
  hltvRating: number;
  hltvRating2: number;
  kast: number;
  damageHealth: number;
  damageArmor: number;
  firstKillCount: number;
  firstDeathCount: number;
  averageDamagePerRound: number;
  averageKillsPerRound: number;
  averageDeathsPerRound: number;
  oneKillCount: number;
  twoKillCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  vsOneCount: number;
  vsTwoCount: number;
  vsThreeCount: number;
  vsFourCount: number;
  vsFiveCount: number;
  vsOneWonCount: number;
  vsTwoWonCount: number;
  vsThreeWonCount: number;
  vsFourWonCount: number;
  vsFiveWonCount: number;
  vsOneLostCount: number;
  vsTwoLostCount: number;
  vsThreeLostCount: number;
  vsFourLostCount: number;
  vsFiveLostCount: number;
  bombPlantedCount: number;
  bombDefusedCount: number;
  hostageRescuedCount: number;
  utilityDamage: number;
  averageUtilityDamagePerRound: number;
  score: number;
  mvpCount: number;
  gameBanCount: number;
  isCommunityBanned: boolean;
  vacBanCount: number;
  lastBanDate: string | null;
};

export type PlayerRow = PlayerQueryResult & {
  name: string;
  rank: Rank;
  winsCount: number;
};

type Filters = {
  checksums?: string[];
  steamIds?: string[];
};

export async function fetchPlayersRows(filters: Filters): Promise<PlayerRow[]> {
  const { count, sum, avg } = db.fn;
  let query = db
    .selectFrom('players')
    .select('steam_id as steamId')
    .select(count<number>('match_checksum').as('matchCount'))
    .select(sum<number>('players.kill_count').as('killCount'))
    .select(sum<number>('players.death_count').as('deathCount'))
    .select(sum<number>('players.assist_count').as('assistCount'))
    .select(sum<number>('players.headshot_count').as('headshotCount'))
    .select(sum<number>('players.first_kill_count').as('firstKillCount'))
    .select(sum<number>('players.first_death_count').as('firstDeathCount'))
    .select(sum<number>('damage_health').as('damageHealth'))
    .select(sum<number>('damage_armor').as('damageArmor'))
    .select(sum<number>('utility_damage').as('utilityDamage'))
    .select(sum<number>('one_kill_count').as('oneKillCount'))
    .select(sum<number>('two_kill_count').as('twoKillCount'))
    .select(sum<number>('three_kill_count').as('threeKillCount'))
    .select(sum<number>('four_kill_count').as('fourKillCount'))
    .select(sum<number>('five_kill_count').as('fiveKillCount'))
    .select(sum<number>('bomb_planted_count').as('bombPlantedCount'))
    .select(sum<number>('bomb_defused_count').as('bombDefusedCount'))
    .select(sum<number>('hostage_rescued_count').as('hostageRescuedCount'))
    .select(sum<number>('mvp_count').as('mvpCount'))
    .select(sum<number>('score').as('score'))
    .select(avg<number>('headshot_percentage').as('headshotPercentage'))
    .select(avg<number>('kast').as('kast'))
    .select(avg<number>('hltv_rating').as('hltvRating'))
    .select(avg<number>('hltv_rating_2').as('hltvRating2'))
    .select(avg<number>('average_damage_per_round').as('averageDamagePerRound'))
    .select(avg<number>('average_kill_per_round').as('averageKillsPerRound'))
    .select(avg<number>('average_death_per_round').as('averageDeathsPerRound'))
    .select(sql<number>`ROUND(AVG(utility_damage_per_round)::numeric, 1)`.as('averageUtilityDamagePerRound'))
    .select(
      sql<number>`ROUND(SUM("players"."kill_count") / GREATEST(SUM("players"."death_count"), 1)::NUMERIC, 1)`.as(
        'killDeathRatio',
      ),
    )
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .groupBy(['steam_id']);

  const checksums = filters.checksums ?? [];
  if (checksums.length > 0) {
    query = query.select('team_name as teamName').where('matches.checksum', 'in', checksums).groupBy('team_name');
  }

  const filterSteamIds = filters.steamIds ?? [];
  if (filterSteamIds.length > 0) {
    query = query.where('players.steam_id', 'in', filterSteamIds);
  }

  const players = await query.execute();

  const steamIds = players.map((player) => player.steamId);
  const [lastPlayersData, playersClutchStats] = await Promise.all([
    fetchLastPlayersData(steamIds),
    fetchPlayersClutchStats(checksums, steamIds),
  ]);

  const rows: PlayerRow[] = players.map((player) => {
    const lastData = lastPlayersData.find((data) => data.steamId === player.steamId);
    const clutchStats = playersClutchStats.find((stats) => stats.clutcherSteamId === player.steamId);
    if (!lastData) {
      throw new Error(`Last player data not found for steamId: ${player.steamId}`);
    }

    return {
      ...player,
      ...lastData,
      teamName: 'teamName' in player && typeof player.teamName === 'string' ? player.teamName : '',
      gameBanCount: lastData.gameBanCount ?? 0,
      isCommunityBanned: lastData.isCommunityBanned ?? false,
      vacBanCount: lastData.vacBanCount ?? 0,
      lastBanDate: lastData.lastBanDate?.toISOString() ?? null,
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
    };
  });

  return rows;
}
