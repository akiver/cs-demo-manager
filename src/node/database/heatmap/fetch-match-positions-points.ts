import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { db } from 'csdm/node/database/database';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { sql } from 'kysely';

export async function fetchMatchPositionsPoints(filters: MatchHeatmapFilter): Promise<Point[]> {
  let query = db
    .selectFrom('player_positions')
    .select(['player_positions.x', 'player_positions.y'])
    .where('player_positions.match_checksum', '=', filters.checksum)
    .where('player_positions.is_alive', '=', true)
    .where(sql`player_positions.tick % 64`, '=', 0);

  if (filters.thresholdZ) {
    query = query.where('player_positions.z', filters.radarLevel === RadarLevel.Upper ? '>=' : '<', filters.thresholdZ);
  }

  if (filters.sides.length > 0) {
    query = query.where('player_positions.side', 'in', filters.sides);
  }

  if (filters.steamIds.length > 0) {
    query = query.where('player_positions.player_steam_id', 'in', filters.steamIds);
  }

  // Team filtering via join with players table since player_positions has no team_name column
  if (filters.teamNames.length > 0) {
    query = query
      .innerJoin('players', (join) =>
        join
          .onRef('players.steam_id', '=', 'player_positions.player_steam_id')
          .onRef('players.match_checksum', '=', 'player_positions.match_checksum'),
      )
      .where('players.team_name', 'in', filters.teamNames);
  }

  // Apply per-round tick ranges for time-interval filtering
  if (filters.tickRanges.length > 0) {
    query = query.where((eb) => {
      return eb.or(
        filters.tickRanges.map((range) =>
          eb.and([
            eb('player_positions.round_number', '=', range.roundNumber),
            eb('player_positions.tick', '>=', range.startTick),
            eb('player_positions.tick', '<=', range.endTick),
          ]),
        ),
      );
    });
  } else if (filters.rounds.length > 0) {
    // Fallback: no time filter, just round filter
    query = query.where('player_positions.round_number', 'in', filters.rounds);
  }

  const points = await query.execute();

  return points;
}
