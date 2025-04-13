import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { TeamFilters } from './team-filters';
import type { MapStats } from 'csdm/common/types/map-stats';
import { applyMatchFilters } from '../match/apply-match-filters';

type MatchStats = {
  mapName: string;
  matchCount: number;
  winCount: number;
  lostCount: number;
  tiedCount: number;
};

type PlayerStats = {
  mapName: string;
  killDeathRatio: number;
  averageDamagesPerRound: number;
  kast: number;
  headshotPercentage: number;
};

type RoundStats = {
  mapName: string;
  roundCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
  roundWinCount: number;
  roundLostCount: number;
  roundWinCountAsCt: number;
  roundWinCountAsT: number;
};

function buildMatchStatsQuery({ name, ...filters }: TeamFilters) {
  const { count } = db.fn;
  let query = db
    .selectFrom('matches')
    .leftJoin('teams', 'teams.match_checksum', 'matches.checksum')
    .select([
      'matches.map_name as mapName',
      count<number>('matches.checksum').distinct().as('matchCount'),
      sql<number>`COUNT(CASE WHEN matches.winner_name = ${sql`${name}`} THEN 1 END)`.as('winCount'),
      sql<number>`COUNT(CASE WHEN matches.winner_name IS NOT NULL AND matches.winner_name != ${sql`${name}`} THEN 1 END)`.as(
        'lostCount',
      ),
      sql<number>`COUNT(CASE WHEN matches.winner_name IS NULL THEN 1 END)`.as('tiedCount'),
    ])
    .where('teams.name', '=', name)
    .groupBy('mapName');

  query = applyMatchFilters(query, filters);

  return query;
}

function buildStatsQuery({ name, ...filters }: TeamFilters) {
  const { avg } = db.fn;
  let query = db
    .selectFrom('matches')
    .leftJoin('teams', 'teams.match_checksum', 'matches.checksum')
    .innerJoin('players', function (qb) {
      return qb.onRef('players.match_checksum', '=', 'matches.checksum').onRef('players.team_name', '=', 'teams.name');
    })
    .select([
      'matches.map_name as mapName',
      avg<number>('players.kill_death_ratio').as('killDeathRatio'),
      avg<number>('players.average_damage_per_round').as('averageDamagesPerRound'),
      avg<number>('players.kast').as('kast'),
      avg<number>('players.headshot_percentage').as('headshotPercentage'),
    ])
    .where('teams.name', '=', name)
    .groupBy('mapName');

  query = applyMatchFilters(query, filters);

  return query;
}

function buildRoundsQuery({ name, ...filters }: TeamFilters) {
  const { count } = db.fn;
  let query = db
    .selectFrom('rounds')
    .innerJoin('matches', 'rounds.match_checksum', 'matches.checksum')
    .leftJoin('teams', 'teams.match_checksum', 'matches.checksum')
    .select([
      'matches.map_name as mapName',
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_name = ${sql`${name}`})`.as('roundWinCount'),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_name IS NOT NULL AND rounds.winner_name != ${sql`${name}`})`.as(
        'roundLostCount',
      ),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_name = ${sql`${name}`} AND rounds.winner_side = 3)`.as(
        'roundWinCountAsCt',
      ),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_name = ${sql`${name}`} AND rounds.winner_side = 2)`.as(
        'roundWinCountAsT',
      ),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_side = 2)`.as('roundCountAsT'),
      sql<number>`COUNT(rounds.id) FILTER (WHERE rounds.winner_side = 3)`.as('roundCountAsCt'),
      count<number>('rounds.id').as('roundCount'),
    ])
    .where('teams.name', '=', name)
    .groupBy('mapName');

  query = applyMatchFilters(query, filters);

  return query;
}

export async function fetchTeamMapsStats(filters: TeamFilters): Promise<MapStats[]> {
  const statsQuery = buildStatsQuery(filters);
  const roundsQuery = buildRoundsQuery(filters);
  const matchStatsQuery = buildMatchStatsQuery(filters);

  const [matchesStats, playersStats, roundsStats]: [MatchStats[], PlayerStats[], RoundStats[]] = await Promise.all([
    matchStatsQuery.execute(),
    statsQuery.execute(),
    roundsQuery.execute(),
  ]);

  const stats: MapStats[] = [];
  for (const matchStats of matchesStats) {
    const roundStats = roundsStats.find((roundStats) => {
      return roundStats.mapName === matchStats.mapName;
    });
    const playerStats = playersStats.find((roundStats) => {
      return roundStats.mapName === matchStats.mapName;
    });

    if (roundStats && playerStats) {
      stats.push({
        ...matchStats,
        ...playerStats,
        ...roundStats,
      });
    }
  }

  return stats;
}
