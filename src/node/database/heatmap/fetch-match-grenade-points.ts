import { GrenadeName } from 'csdm/common/types/counter-strike';
import type { Point } from 'csdm/common/types/point';
import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { db } from 'csdm/node/database/database';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { RadarLevel } from 'csdm/ui/maps/radar-level';

export async function fetchMatchGrenadePoints(filters: MatchHeatmapFilter): Promise<Point[]> {
  const grenadeNames: GrenadeName[] = [];
  switch (filters.event) {
    case HeatmapEvent.Smoke:
      grenadeNames.push(GrenadeName.Smoke);
      break;
    case HeatmapEvent.Decoy:
      grenadeNames.push(GrenadeName.Decoy);
      break;
    case HeatmapEvent.Flashbang:
      grenadeNames.push(GrenadeName.Flashbang);
      break;
    case HeatmapEvent.HeGrenade:
      grenadeNames.push(GrenadeName.HE);
      break;
    case HeatmapEvent.Molotov:
      grenadeNames.push(GrenadeName.Molotov, GrenadeName.Incendiary);
      break;
    default:
      throw new Error(`Unsupported grenade event: ${filters.event}`);
  }

  let query = db
    .selectFrom('grenade_projectiles_destroy')
    .select(['x', 'y'])
    .where('match_checksum', '=', filters.checksum)
    .where('grenade_name', 'in', grenadeNames);

  if (filters.thresholdZ) {
    query = query.where('z', filters.radarLevel === RadarLevel.Upper ? '>=' : '<', filters.thresholdZ);
  }

  if (filters.sides.length > 0) {
    query = query.where('thrower_side', 'in', filters.sides);
  }
  if (filters.steamIds.length > 0) {
    query = query.where('thrower_steam_id', 'in', filters.steamIds);
  }
  if (filters.rounds.length > 0) {
    query = query.where('round_number', 'in', filters.rounds);
  }
  if (filters.teamNames.length > 0) {
    query = query.where('thrower_team_name', 'in', filters.teamNames);
  }

  const points = query.execute();

  return points;
}
