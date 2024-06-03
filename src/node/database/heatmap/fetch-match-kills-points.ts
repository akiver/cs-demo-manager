import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { db } from 'csdm/node/database/database';
import { RadarLevel } from 'csdm/ui/maps/radar-level';

export async function fetchMatchKillsPoints(filters: MatchHeatmapFilter): Promise<Point[]> {
  switch (filters.event) {
    case HeatmapEvent.Kills: {
      let query = db
        .selectFrom('kills')
        .select(['killer_x as x', 'killer_y as y'])
        .where('match_checksum', '=', filters.checksum);

      if (filters.thresholdZ) {
        query = query.where('killer_z', filters.radarLevel === RadarLevel.Upper ? '>=' : '<', filters.thresholdZ);
      }

      if (filters.rounds.length > 0) {
        query = query.where('round_number', 'in', filters.rounds);
      }
      if (filters.sides.length > 0) {
        query = query.where('killer_side', 'in', filters.sides);
      }
      if (filters.steamIds.length > 0) {
        query = query.where('killer_steam_id', 'in', filters.steamIds);
      }
      if (filters.teamNames.length > 0) {
        query = query.where('killer_team_name', 'in', filters.teamNames);
      }

      const points = await query.execute();

      return points;
    }
    case HeatmapEvent.Deaths: {
      let query = db
        .selectFrom('kills')
        .select(['victim_x as x', 'victim_y as y'])
        .where('match_checksum', '=', filters.checksum);

      if (filters.thresholdZ) {
        query = query.where('victim_z', filters.radarLevel === RadarLevel.Upper ? '>=' : '<', filters.thresholdZ);
      }

      if (filters.rounds.length > 0) {
        query = query.where('round_number', 'in', filters.rounds);
      }
      if (filters.sides.length > 0) {
        query = query.where('victim_side', 'in', filters.sides);
      }
      if (filters.steamIds.length > 0) {
        query = query.where('victim_steam_id', 'in', filters.steamIds);
      }
      if (filters.teamNames.length > 0) {
        query = query.where('victim_team_name', 'in', filters.teamNames);
      }
      const points = await query.execute();

      return points;
    }
    default:
      throw new Error(`Unsupported kills points event: ${filters.event}`);
  }
}
