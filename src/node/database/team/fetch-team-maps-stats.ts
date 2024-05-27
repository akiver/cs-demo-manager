import { sql } from 'kysely';
import { db } from 'csdm/node/database/database';
import type { FetchTeamFilters } from './fetch-team-filters';
import type { MapStats } from 'csdm/common/types/map-stats';

type MapGlobalStats = {
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

type MapRoundStats = {
  mapName: string;
  roundCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
  roundWinCount: number;
  roundLostCount: number;
  roundWinCountAsCt: number;
  roundWinCountAsT: number;
};

function buildStatsQuery({
  name,
  startDate,
  endDate,
  sources,
  games,
  gameModes,
  tagIds,
  maxRounds,
  demoTypes,
}: FetchTeamFilters) {
  const { count, avg } = db.fn;
  let query = db
    .selectFrom('matches')
    .leftJoin('teams', 'teams.match_checksum', 'matches.checksum')
    .innerJoin('players', function (qb) {
      return qb.onRef('players.match_checksum', '=', 'matches.checksum').onRef('players.team_name', '=', 'teams.name');
    })
    .select([
      'matches.map_name as mapName',
      count<number>('matches.checksum').distinct().as('matchCount'),
      sql<number>`COUNT(DISTINCT CASE WHEN matches.winner_name = ${sql`${name}`} THEN 1 END)`.as('winCount'),
      sql<number>`COUNT(DISTINCT CASE WHEN matches.winner_name IS NOT NULL AND matches.winner_name != ${sql`${name}`} THEN 1 END)`.as(
        'lostCount',
      ),
      sql<number>`COUNT(DISTINCT CASE WHEN matches.winner_name IS NULL THEN 1 END)`.as('tiedCount'),
      avg<number>('players.kill_death_ratio').as('killDeathRatio'),
      avg<number>('players.average_damage_per_round').as('averageDamagesPerRound'),
      avg<number>('players.kast').as('kast'),
      avg<number>('players.headshot_percentage').as('headshotPercentage'),
    ])
    .where('teams.name', '=', name)
    .groupBy('mapName');

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (sources.length > 0) {
    query = query.where('matches.source', 'in', sources);
  }

  if (games.length > 0) {
    query = query.where('matches.game', 'in', games);
  }

  if (demoTypes.length > 0) {
    query = query.where('matches.type', 'in', demoTypes);
  }

  if (gameModes.length > 0) {
    query = query.where('game_mode_str', 'in', gameModes);
  }

  if (maxRounds.length > 0) {
    query = query.where('max_rounds', 'in', maxRounds);
  }

  if (tagIds.length > 0) {
    query = query
      .innerJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', tagIds);
  }

  return query;
}

function buildRoundsQuery({
  name,
  startDate,
  endDate,
  sources,
  games,
  gameModes,
  tagIds,
  maxRounds,
  demoTypes,
}: FetchTeamFilters) {
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

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (sources.length > 0) {
    query = query.where('source', 'in', sources);
  }

  if (games.length > 0) {
    query = query.where('game', 'in', games);
  }

  if (demoTypes.length > 0) {
    query = query.where('matches.type', 'in', demoTypes);
  }

  if (gameModes.length > 0) {
    query = query.where('game_mode_str', 'in', gameModes);
  }

  if (maxRounds.length > 0) {
    query = query.where('max_rounds', 'in', maxRounds);
  }

  if (tagIds.length > 0) {
    query = query
      .innerJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', tagIds);
  }

  return query;
}

export async function fetchTeamMapsStats(filters: FetchTeamFilters): Promise<MapStats[]> {
  const statsQuery = buildStatsQuery(filters);
  const roundsQuery = buildRoundsQuery(filters);

  const [globalStats, roundsStats]: [MapGlobalStats[], MapRoundStats[]] = await Promise.all([
    statsQuery.execute(),
    roundsQuery.execute(),
  ]);

  const stats: MapStats[] = [];
  for (const matchStats of globalStats) {
    const roundStats = roundsStats.find((roundStats) => {
      return roundStats.mapName === matchStats.mapName;
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
