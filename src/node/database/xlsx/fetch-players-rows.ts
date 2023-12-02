import { sql } from 'kysely';
import type { Rank } from 'csdm/common/types/counter-strike';
import { db } from 'csdm/node/database/database';
import { fetchPlayersClutchStats } from '../clutches/fetch-players-clutch-stats';
import { fetchLastPlayersLastData } from '../player/fetch-players-last-data';

type PlayerQueryResult = {
  steamId: string;
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
};

export type PlayerRow = PlayerQueryResult & {
  name: string;
  rank: Rank;
  winsCount: number;
};

export async function fetchPlayersRows(checksums: string[]) {
  const { count, sum, avg } = db.fn;
  const players = await db
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
    .select(sum<number>('one_kill_count').as('oneKillCount'))
    .select(sum<number>('two_kill_count').as('twoKillCount'))
    .select(sum<number>('three_kill_count').as('threeKillCount'))
    .select(sum<number>('four_kill_count').as('fourKillCount'))
    .select(sum<number>('five_kill_count').as('fiveKillCount'))
    .select(sum<number>('bomb_planted_count').as('bombPlantedCount'))
    .select(sum<number>('bomb_defused_count').as('bombDefusedCount'))
    .select(sum<number>('hostage_rescued_count').as('hostageRescuedCount'))
    .select(avg<number>('headshot_percentage').as('headshotPercentage'))
    .select(avg<number>('kast').as('kast'))
    .select(avg<number>('hltv_rating').as('hltvRating'))
    .select(avg<number>('hltv_rating_2').as('hltvRating2'))
    .select(avg<number>('average_damage_per_round').as('averageDamagePerRound'))
    .select(
      sql<number>`ROUND(SUM("players"."kill_count") / GREATEST(SUM("players"."death_count"), 1)::NUMERIC, 1)`.as(
        'killDeathRatio',
      ),
    )
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .where('matches.checksum', 'in', checksums)
    .groupBy('steam_id')
    .execute();

  const steamIds = players.map((player) => player.steamId);
  const [lastPlayersData, playersClutchStats] = await Promise.all([
    fetchLastPlayersLastData(steamIds),
    fetchPlayersClutchStats(checksums, steamIds),
  ]);

  const rows: PlayerRow[] = players.map((player) => {
    const lastData = lastPlayersData.get(player.steamId);
    const clutchStats = playersClutchStats.find((stats) => stats.clutcherSteamId === player.steamId);

    return {
      ...player,
      name: lastData?.name ?? '',
      rank: lastData?.rank ?? 0,
      winsCount: lastData?.winsCount ?? 0,
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
