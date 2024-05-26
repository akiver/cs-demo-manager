import { sql } from 'kysely';
import type { Point } from 'csdm/common/types/point';
import type { TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { db } from 'csdm/node/database/database';

export async function fetchTeamShotsPoints(filters: TeamHeatmapFilter): Promise<Point[]> {
  let query = db
    .selectFrom('shots')
    .select(['x', 'y'])
    .leftJoin('matches', 'checksum', 'match_checksum')
    .where('matches.map_name', '=', filters.mapName)
    .where('player_team_name', '=', filters.teamName);

  if (filters.startDate !== undefined && filters.endDate !== undefined) {
    query = query.where(sql<boolean>`matches.date between ${filters.startDate} and ${filters.endDate}`);
  }

  if (filters.sources.length > 0) {
    query = query.where('matches.source', 'in', filters.sources);
  }

  if (filters.games.length > 0) {
    query = query.where('matches.game', 'in', filters.games);
  }

  if (filters.demoTypes.length > 0) {
    query = query.where('matches.type', 'in', filters.demoTypes);
  }

  if (filters.gameModes.length > 0) {
    query = query.where('matches.game_mode_str', 'in', filters.gameModes);
  }

  if (filters.maxRounds.length > 0) {
    query = query.where('max_rounds', 'in', filters.maxRounds);
  }

  if (filters.sides.length > 0) {
    query = query.where('player_side', 'in', filters.sides);
  }

  if (filters.tagIds.length > 0) {
    query = query
      .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', filters.tagIds);
  }

  const points = await query.execute();

  return points;
}
