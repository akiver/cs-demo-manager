import type { Point } from '../../../common/types/point';
import type { HeatmapOptions } from 'csdm/common/types/heatmap-options';
import { db } from 'csdm/node/database/database';

export async function fetchShotsPoints(options: HeatmapOptions): Promise<Point[]> {
  let query = db.selectFrom('shots').select(['x', 'y']).where('match_checksum', '=', options.checksum);

  if (options.rounds.length > 0) {
    query = query.where('round_number', 'in', options.rounds);
  }
  if (options.sides.length > 0) {
    query = query.where('player_side', 'in', options.sides);
  }
  if (options.steamIds.length > 0) {
    query = query.where('player_steam_id', 'in', options.steamIds);
  }
  if (options.teamNames.length > 0) {
    query = query.where('player_team_name', 'in', options.teamNames);
  }

  const points = await query.execute();

  return points;
}
