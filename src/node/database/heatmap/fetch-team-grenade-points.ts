import { sql } from 'kysely';
import { GrenadeName } from 'csdm/common/types/counter-strike';
import type { Point } from 'csdm/common/types/point';
import type { TeamHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import { db } from 'csdm/node/database/database';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';

export async function fetchTeamGrenadePoints(filters: TeamHeatmapFilter): Promise<Point[]> {
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
    .leftJoin('matches', 'checksum', 'match_checksum')
    .where('matches.map_name', '=', filters.mapName)
    .where('thrower_team_name', '=', filters.teamName)
    .where('grenade_name', 'in', grenadeNames);

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
    query = query.where('thrower_side', 'in', filters.sides);
  }

  if (filters.tagIds.length > 0) {
    query = query
      .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', filters.tagIds);
  }

  const points = query.execute();

  return points;
}
