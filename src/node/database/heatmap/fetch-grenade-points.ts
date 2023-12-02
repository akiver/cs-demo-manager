import { GrenadeName } from 'csdm/common/types/counter-strike';
import type { Point } from 'csdm/common/types/point';
import type { HeatmapOptions } from 'csdm/common/types/heatmap-options';
import { db } from 'csdm/node/database/database';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';

export async function fetchGrenadePoints(options: HeatmapOptions): Promise<Point[]> {
  const grenadeNames: GrenadeName[] = [];
  switch (options.event) {
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
      throw new Error(`Unsupported grenade event: ${options.event}`);
  }

  let query = db
    .selectFrom('grenade_projectiles_destroy')
    .select(['x', 'y'])
    .where('match_checksum', '=', options.checksum)
    .where('grenade_name', 'in', grenadeNames);

  if (options.sides.length > 0) {
    query = query.where('thrower_side', 'in', options.sides);
  }
  if (options.steamIds.length > 0) {
    query = query.where('thrower_steam_id', 'in', options.steamIds);
  }
  if (options.rounds.length > 0) {
    query = query.where('round_number', 'in', options.rounds);
  }
  if (options.teamNames.length > 0) {
    query = query.where('thrower_team_name', 'in', options.teamNames);
  }

  const points = query.execute();

  return points;
}
