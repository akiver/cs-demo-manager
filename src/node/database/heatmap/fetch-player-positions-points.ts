import { sql } from 'kysely';
import type { PlayerHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { db } from 'csdm/node/database/database';
import { readPositionSamplePoints } from 'csdm/node/database/player-position-samples/read-position-sample-points';

export async function fetchPlayerPositionsPoints(filters: PlayerHeatmapFilter): Promise<Point[]> {
  let query = db
    .selectFrom('player_position_samples')
    .select([
      'player_position_samples.ticks',
      'player_position_samples.x',
      'player_position_samples.y',
      'player_position_samples.z',
    ])
    .innerJoin('matches', 'matches.checksum', 'player_position_samples.match_checksum')
    .innerJoin('demos', 'demos.checksum', 'matches.checksum')
    .where('player_position_samples.player_steam_id', '=', filters.steamId)
    .where('demos.map_name', '=', filters.mapName);

  if (filters.startDate !== undefined && filters.endDate !== undefined) {
    query = query.where(sql<boolean>`demos.date between ${filters.startDate} and ${filters.endDate}`);
  }

  if (filters.sources.length > 0) {
    query = query.where('demos.source', 'in', filters.sources);
  }

  if (filters.games.length > 0) {
    query = query.where('demos.game', 'in', filters.games);
  }

  if (filters.demoTypes.length > 0) {
    query = query.where('demos.type', 'in', filters.demoTypes);
  }

  if (filters.gameModes.length > 0) {
    query = query.where('matches.game_mode_str', 'in', filters.gameModes);
  }

  if (filters.maxRounds.length > 0) {
    query = query.where('matches.max_rounds', 'in', filters.maxRounds);
  }

  if (filters.sides.length > 0) {
    query = query.where('player_position_samples.side', 'in', filters.sides);
  }

  if (filters.tagIds.length > 0) {
    query = query
      .innerJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', filters.tagIds);
  }

  const rows = await query.execute();
  // Maps without a lower level have a threshold of 0, it means no threshold like in the other heatmap queries.
  const thresholdZ = filters.thresholdZ || null;

  return rows.flatMap((row) => {
    return readPositionSamplePoints(row, {
      startTick: 0,
      endTick: null,
      thresholdZ,
      radarLevel: filters.radarLevel,
    });
  });
}
