import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { fetchLastPlayersData, type LastPlayersData } from '../../players/fetch-last-players-data';
import type { Rank } from 'csdm/common/types/counter-strike';

export type PlayerRow = {
  steamId: string;
  name: string;
  matchCount: number;
  killCount: number;
  assistCount: number;
  deathCount: number;
  headshotCount: number;
  mvpCount: number;
  headshotPercentage: number;
  utilityDamage: number;
  averageDamagePerRound: number;
  utilityDamagePerRound: number;
  rank: Rank;
  killDeathRatio: number;
  kast: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  isCommunityBanned: boolean;
  isVacBanned: boolean;
  isGameBanned: boolean;
  hltvRating: number;
  hltvRating2: number;
};

type PlayersXlsxFilter = {
  startDate: string | undefined;
  endDate: string | undefined;
};

type PlayersStatsResult = {
  steamId: string;
  killCount: number;
  assistCount: number;
  deathCount: number;
  headshotCount: number;
  mvpCount: number;
  headshotPercentage: number;
  utilityDamage: number;
  averageDamagePerRound: number;
  utilityDamagePerRound: number;
  killDeathRatio: number;
  kast: number;
  matchCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  hltvRating: number;
  hltvRating2: number;
  comment: string | null;
};

async function fetchPlayersStats(steamIds: string[], filter: PlayersXlsxFilter): Promise<PlayersStatsResult[]> {
  const { count, sum, avg } = db.fn;
  let query = db
    .selectFrom('players')
    .select([
      'players.steam_id as steamId',
      count<number>('matches.checksum').as('matchCount'),
      sum<number>('players.kill_count').as('killCount'),
      sum<number>('players.death_count').as('deathCount'),
      sql<number>`SUM(players.kill_count)::NUMERIC / NULLIF(SUM(players.death_count), 0)::NUMERIC`.as('killDeathRatio'),
      sum<number>('players.assist_count').as('assistCount'),
      sum<number>('headshot_count').as('headshotCount'),
      sum<number>('three_kill_count').as('threeKillCount'),
      sum<number>('four_kill_count').as('fourKillCount'),
      sum<number>('five_kill_count').as('fiveKillCount'),
      sum<number>('mvp_count').as('mvpCount'),
      sum<number>('utility_damage').as('utilityDamage'),
      avg<number>('headshot_percentage').as('headshotPercentage'),
      avg<number>('utility_damage_per_round').as('utilityDamagePerRound'),
      avg<number>('kast').as('kast'),
      avg<number>('hltv_rating').as('hltvRating'),
      avg<number>('hltv_rating_2').as('hltvRating2'),
      avg<number>('average_damage_per_round').as('averageDamagePerRound'),
    ])
    .leftJoin('player_comments', 'player_comments.steam_id', 'players.steam_id')
    .select('player_comments.comment')
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .where('players.steam_id', 'in', steamIds)
    .orderBy('players.steam_id')
    .groupBy(['players.steam_id', 'player_comments.comment']);

  const { startDate, endDate } = filter;
  if (startDate && endDate) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  const playersStats: PlayersStatsResult[] = await query.execute();

  return playersStats;
}

function buildRows(playersStats: PlayersStatsResult[], lastPlayersData: LastPlayersData[]): PlayerRow[] {
  const players: PlayerRow[] = [];
  for (const playerStats of playersStats) {
    const lastPlayerData = lastPlayersData.find((row) => {
      return row.steamId === playerStats.steamId;
    });
    if (lastPlayerData) {
      players.push({
        ...playerStats,
        name: lastPlayerData.lastKnownName ?? lastPlayerData.name,
        rank: lastPlayerData.rank,
        isVacBanned: lastPlayerData.vacBanCount ? lastPlayerData.vacBanCount > 0 : false,
        isGameBanned: lastPlayerData.gameBanCount ? lastPlayerData.gameBanCount > 0 : false,
        isCommunityBanned: lastPlayerData.isCommunityBanned ?? false,
      });
    } else {
      logger.warn(`Data for player with SteamID ${playerStats.steamId} not found while building rows`);
    }
  }

  return players;
}

export async function fetchPlayersRows(steamIds: string[], filter: PlayersXlsxFilter): Promise<PlayerRow[]> {
  const [playersStats, lastPlayersData] = await Promise.all([
    fetchPlayersStats(steamIds, filter),
    fetchLastPlayersData(steamIds),
  ]);
  const players = buildRows(playersStats, lastPlayersData);

  return players;
}
