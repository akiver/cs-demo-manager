import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import { applyMatchFilters, type MatchFilters } from '../match/apply-match-filters';
import type { PlayerMapsStats } from 'csdm/common/types/map-stats';

type GlobalStats = {
  steamId: string;
  mapName: string;
  matchCount: number;
  winCount: number;
  lostCount: number;
  tiedCount: number;
  killDeathRatio: number;
  averageDamagesPerRound: number;
  kast: number;
  headshotPercentage: number;
};

type RoundStats = {
  steamId: string;
  mapName: string;
  roundCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
  roundWinCount: number;
  roundLostCount: number;
  roundWinCountAsCt: number;
  roundWinCountAsT: number;
};

function buildStatsQuery(steamIds: string[], filters?: MatchFilters) {
  const { count, avg } = db.fn;
  let query = db
    .selectFrom('matches')
    .innerJoin('players', 'players.match_checksum', 'matches.checksum')
    .select([
      'players.steam_id as steamId',
      'matches.map_name as mapName',
      sql<number>`COUNT(matches.checksum) FILTER (WHERE matches.winner_name = players.team_name)`.as('winCount'),
      sql<number>`COUNT(matches.checksum) FILTER (WHERE matches.winner_name IS NOT NULL AND matches.winner_name != players.team_name)`.as(
        'lostCount',
      ),
      sql<number>`COUNT(matches.checksum) FILTER (WHERE matches.winner_name IS NULL)`.as('tiedCount'),
      count<number>('matches.checksum').as('matchCount'),
      sql<number>`SUM(players.kill_count)::NUMERIC / NULLIF(SUM(players.death_count), 0)::NUMERIC`.as('killDeathRatio'),
      avg<number>('players.average_damage_per_round').as('averageDamagesPerRound'),
      avg<number>('players.kast').as('kast'),
      avg<number>('players.headshot_percentage').as('headshotPercentage'),
    ])
    .where('players.steam_id', 'in', steamIds)
    .orderBy('steamId')
    .orderBy('mapName')
    .groupBy(['mapName', 'steamId']);

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  return query;
}

function buildRoundsQuery(steamIds: string[], filters?: MatchFilters) {
  const { count } = db.fn;
  let query = db
    .selectFrom('rounds')
    .innerJoin('matches', 'rounds.match_checksum', 'matches.checksum')
    .innerJoin('players', 'players.match_checksum', 'matches.checksum')
    .select([
      'players.steam_id as steamId',
      'matches.map_name as mapName',
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_name = players.team_name)`.as('roundWinCount'),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_name IS NOT NULL AND rounds.winner_name != players.team_name)`.as(
        'roundLostCount',
      ),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_name = players.team_name AND rounds.winner_side = 3)`.as(
        'roundWinCountAsCt',
      ),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_name = players.team_name AND rounds.winner_side = 2)`.as(
        'roundWinCountAsT',
      ),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_side = 2)`.as('roundCountAsT'),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_side = 3)`.as('roundCountAsCt'),
      count<number>('rounds.id').as('roundCount'),
    ])
    .where('players.steam_id', 'in', steamIds)
    .orderBy('steamId')
    .orderBy('mapName')
    .groupBy(['mapName', 'steamId']);

  if (filters) {
    query = applyMatchFilters(query, filters);
  }

  return query;
}

export async function fetchPlayersMapsStats(steamIds: string[], filters?: MatchFilters): Promise<PlayerMapsStats[]> {
  const globalQuery = buildStatsQuery(steamIds, filters);
  const roundsQuery = buildRoundsQuery(steamIds, filters);

  const [globalStats, roundsStats]: [GlobalStats[], RoundStats[]] = await Promise.all([
    globalQuery.execute(),
    roundsQuery.execute(),
  ]);

  const stats: PlayerMapsStats[] = [];
  for (const matchStats of globalStats) {
    const roundStats = roundsStats.find((roundStats) => {
      return roundStats.mapName === matchStats.mapName && roundStats.steamId === matchStats.steamId;
    });

    if (roundStats !== undefined) {
      stats.push({
        ...matchStats,
        ...roundStats,
      });
    }
  }

  return stats;
}
