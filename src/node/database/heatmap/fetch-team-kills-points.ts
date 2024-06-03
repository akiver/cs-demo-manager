import { sql } from 'kysely';
import type { TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { db } from 'csdm/node/database/database';
import { RadarLevel } from 'csdm/ui/maps/radar-level';

function buildQuery(filters: TeamHeatmapFilter) {
  let query = db
    .selectFrom('kills')
    .leftJoin('matches', 'checksum', 'match_checksum')
    .where('matches.map_name', '=', filters.mapName);

  if (filters.thresholdZ) {
    query = query.where('killer_z', filters.radarLevel === RadarLevel.Upper ? '>=' : '<', filters.thresholdZ);
  }

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
    query = query.where('killer_side', 'in', filters.sides);
  }

  if (filters.tagIds.length > 0) {
    query = query
      .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', filters.tagIds);
  }

  return query;
}

export async function fetchTeamKillsPoints(filters: TeamHeatmapFilter): Promise<Point[]> {
  switch (filters.event) {
    case HeatmapEvent.Kills: {
      const query = buildQuery(filters)
        .select(['killer_x as x', 'killer_y as y'])
        .where('killer_team_name', '=', filters.teamName);

      const points = await query.execute();

      return points;
    }
    case HeatmapEvent.Deaths: {
      const query = buildQuery(filters)
        .select(['victim_x as x', 'victim_y as y'])
        .where('victim_team_name', '=', filters.teamName);

      const points = await query.execute();

      return points;
    }
    default:
      throw new Error(`Unsupported kills points event: ${filters.event}`);
  }
}
