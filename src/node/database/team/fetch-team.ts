import { sql, type ReferenceExpression } from 'kysely';
import type { Database } from 'csdm/node/database/schema';
import { db } from 'csdm/node/database/database';
import type { TeamFilters } from './team-filters';
import { fetchTeamMatchCountStats } from './fetch-team-match-count-stats';
import type { TeamProfile } from 'csdm/common/types/team-profile';
import { TeamNotFound } from './error/team-not-found';
import { fetchMatchesTable } from '../matches/fetch-matches-table';
import { fetchTeamCollateralKillCount } from './fetch-team-collateral-kill-count';
import { fetchTeamRoundCount } from './fetch-team-rounds-count';
import { fetchTeamLastMatches } from './fetch-team-last-matches';
import { fetchTeamClutches } from './fetch-team-clutches';
import { fetchTeamMapsStats } from './fetch-team-maps-stats';
import { fetchTeamEconomyStats } from './fetch-team-economy-stats';
import { applyMatchFilters } from '../match/apply-match-filters';
import { fetchTeamMatchSideStats } from './fetch-team-match-side-stats';
import { fetchTeamBombsStats } from './fetch-team-bombs-stats';

function buildQuery({ name, ...filters }: TeamFilters) {
  const { count, avg, sum } = db.fn;

  let query = db
    .selectFrom('teams')
    .select([
      'teams.name as name',
      count<number>('teams.match_checksum').distinct().as('matchCount'),
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
        type KillsRef = ReferenceExpression<Database, 'kills'>;
        let wallbangsQuery = qb
          .selectFrom('kills')
          .select(({ fn }) => {
            return fn.coalesce<KillsRef, KillsRef>(fn.count('kills.id'), sql`0`).as('wallbangKillCount');
          })
          .leftJoin('matches', 'matches.checksum', 'kills.match_checksum')
          .where('killer_team_name', '=', name)
          .where('penetrated_objects', '>', 0);

        wallbangsQuery = applyMatchFilters(wallbangsQuery, filters);

        return wallbangsQuery.as('wallbangKillCount');
      },
    ])
    .leftJoin('matches', 'matches.checksum', 'teams.match_checksum')
    .leftJoin('players', (join) => {
      return join
        .onRef('players.match_checksum', '=', 'teams.match_checksum')
        .onRef('players.team_name', '=', 'teams.name');
    })
    .where('teams.name', '=', name)
    .groupBy(['teams.name']);

  query = applyMatchFilters(query, filters);

  return query;
}

export async function fetchTeam(filters: TeamFilters): Promise<TeamProfile> {
  const query = buildQuery(filters);
  const row = await query.executeTakeFirst();

  if (!row) {
    throw new TeamNotFound();
  }

  const [
    matchCountStats,
    lastMatches,
    roundCount,
    matches,
    collateralKillCount,
    clutches,
    maps,
    economyStats,
    sideStats,
    bombsStats,
  ] = await Promise.all([
    fetchTeamMatchCountStats(filters),
    fetchTeamLastMatches(filters.name),
    fetchTeamRoundCount(filters),
    fetchMatchesTable({
      ...filters,
      teamName: filters.name,
    }),
    fetchTeamCollateralKillCount(filters),
    fetchTeamClutches(filters),
    fetchTeamMapsStats(filters),
    fetchTeamEconomyStats(filters),
    fetchTeamMatchSideStats(filters),
    fetchTeamBombsStats(filters),
  ]);
  const team: TeamProfile = {
    ...row,
    ...matchCountStats,
    matches,
    collateralKillCount,
    clutches,
    lastMatches,
    mapsStats: maps,
    roundCount: roundCount.totalCount,
    roundCountAsCt: roundCount.roundCountAsCt,
    roundCountAsT: roundCount.roundCountAsT,
    economyStats,
    sideStats,
    bombsStats,
  };

  return team;
}
