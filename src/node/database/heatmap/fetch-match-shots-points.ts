import type { Point } from 'csdm/common/types/point';
import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { db } from 'csdm/node/database/database';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { buildMatchHeatmapTimeConditions } from './build-match-heatmap-time-conditions';

export async function fetchMatchShotsPoints(filters: MatchHeatmapFilter): Promise<Point[]> {
  let query = db.selectFrom('shots').select(['x', 'y']).where('match_checksum', '=', filters.checksum);

  if (filters.thresholdZ) {
    query = query.where('z', filters.radarLevel === RadarLevel.Upper ? '>=' : '<', filters.thresholdZ);
  }

  if (filters.rounds.length > 0) {
    query = query.where('round_number', 'in', filters.rounds);
  }
  if (filters.sides.length > 0) {
    query = query.where('player_side', 'in', filters.sides);
  }
  if (filters.steamIds.length > 0) {
    query = query.where('player_steam_id', 'in', filters.steamIds);
  }
  if (filters.teamNames.length > 0) {
    query = query.where('player_team_name', 'in', filters.teamNames);
  }
  for (const condition of buildMatchHeatmapTimeConditions(filters, 'shots')) {
    query = query.where(condition);
  }

  const points = await query.execute();

  return points;
}
