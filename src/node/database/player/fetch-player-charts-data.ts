import { sql } from 'kysely';
import { RankingFilter } from 'csdm/common/types/ranking-filter';
import type { PlayerChartsData } from 'csdm/common/types/charts/player-charts-data';
import { db } from 'csdm/node/database/database';
import type { FetchPlayerFilters } from './fetch-player-filters';

export async function fetchPlayerChartsData({
  steamId,
  startDate,
  endDate,
  sources,
  games,
  ranking,
  gameModes,
  tagIds,
  maxRounds,
  demoTypes,
}: FetchPlayerFilters): Promise<PlayerChartsData[]> {
  let query = db
    .selectFrom('players')
    .select([
      'headshot_percentage as headshotPercentage',
      'average_damage_per_round as averageDamagePerRound',
      'kill_death_ratio as killDeathRatio',
    ])
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .select(sql<string>`to_char(matches.date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as('matchDate'))
    .leftJoin('clutches', function (qb) {
      return qb
        .onRef('clutches.match_checksum', '=', 'players.match_checksum')
        .onRef('players.steam_id', '=', 'clutches.clutcher_steam_id');
    })
    .select([
      sql<number>`ROUND(COUNT(clutches.id) FILTER (WHERE clutches.won = TRUE) * 100.0 / GREATEST(COUNT(clutches.id), 1), 1)::numeric`.as(
        'clutchWonPercentage',
      ),
    ])
    .where('steam_id', '=', steamId)
    .groupBy(['headshotPercentage', 'averageDamagePerRound', 'killDeathRatio', 'matches.date'])
    .orderBy('date', 'asc');

  if (startDate !== undefined && endDate !== undefined) {
    query = query.where(sql`matches.date between ${startDate} and ${endDate}`);
  }

  if (ranking !== RankingFilter.All) {
    query = query.where('matches.is_ranked', '=', ranking === RankingFilter.Ranked);
  }

  if (sources.length > 0) {
    query = query.where('source', 'in', sources);
  }

  if (games.length > 0) {
    query = query.where('game', 'in', games);
  }

  if (demoTypes.length > 0) {
    query = query.where('type', 'in', demoTypes);
  }

  if (gameModes.length > 0) {
    query = query.where('game_mode_str', 'in', gameModes);
  }

  if (maxRounds.length > 0) {
    query = query.where('max_rounds', 'in', maxRounds);
  }

  if (tagIds.length > 0) {
    query = query
      .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', tagIds);
  }

  const data: PlayerChartsData[] = await query.execute();

  return data;
}
