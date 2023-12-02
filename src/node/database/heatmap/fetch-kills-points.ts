import type { HeatmapOptions } from 'csdm/common/types/heatmap-options';
import type { Point } from '../../../common/types/point';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { db } from 'csdm/node/database/database';

export async function fetchKillsPoints(options: HeatmapOptions): Promise<Point[]> {
  switch (options.event) {
    case HeatmapEvent.Kills: {
      let query = db
        .selectFrom('kills')
        .select(['killer_x as x', 'killer_y as y'])
        .where('match_checksum', '=', options.checksum);

      if (options.rounds.length > 0) {
        query = query.where('round_number', 'in', options.rounds);
      }
      if (options.sides.length > 0) {
        query = query.where('killer_side', 'in', options.sides);
      }
      if (options.steamIds.length > 0) {
        query = query.where('killer_steam_id', 'in', options.steamIds);
      }
      if (options.teamNames.length > 0) {
        query = query.where('killer_team_name', 'in', options.teamNames);
      }

      const points = await query.execute();

      return points;
    }
    case HeatmapEvent.Deaths: {
      let query = db
        .selectFrom('kills')
        .select(['victim_x as x', 'victim_y as y'])
        .where('match_checksum', '=', options.checksum);

      if (options.rounds.length > 0) {
        query = query.where('round_number', 'in', options.rounds);
      }
      if (options.sides.length > 0) {
        query = query.where('victim_side', 'in', options.sides);
      }
      if (options.steamIds.length > 0) {
        query = query.where('victim_steam_id', 'in', options.steamIds);
      }
      if (options.teamNames.length > 0) {
        query = query.where('victim_team_name', 'in', options.teamNames);
      }
      const points = await query.execute();

      return points;
    }
    default:
      throw new Error(`Unsupported kills points event: ${options.event}`);
  }
}
