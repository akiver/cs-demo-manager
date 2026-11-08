import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Point } from 'csdm/common/types/point';
import { BombPlantPhase } from 'csdm/common/types/bomb-plant-phase';
import { db } from 'csdm/node/database/database';
import { readPositionSamplePoints } from 'csdm/node/database/player-position-samples/read-position-sample-points';

type TickWindow = {
  startTick: number;
  endTick: number | null;
};

// Returns the absolute tick window to keep for each selected round, from the time range and the bomb plant phase.
async function fetchRoundsTickWindows(filters: MatchHeatmapFilter, tickrate: number): Promise<Map<number, TickWindow>> {
  let roundsQuery = db
    .selectFrom('rounds')
    .select(['number', 'freeze_time_end_tick'])
    .where('match_checksum', '=', filters.checksum);
  if (filters.rounds.length > 0) {
    roundsQuery = roundsQuery.where('number', 'in', filters.rounds);
  }
  const rounds = await roundsQuery.execute();

  const plantTickPerRound = new Map<number, number>();
  if (filters.plantPhase !== null) {
    const bombsPlanted = await db
      .selectFrom('bombs_planted')
      .select(['round_number', 'tick'])
      .where('match_checksum', '=', filters.checksum)
      .execute();
    for (const { round_number, tick } of bombsPlanted) {
      const plantTick = plantTickPerRound.get(round_number);
      if (plantTick === undefined || tick < plantTick) {
        plantTickPerRound.set(round_number, tick);
      }
    }
  }

  const { startSeconds, endSeconds } = filters.timeRange;
  const tickWindows = new Map<number, TickWindow>();
  for (const round of rounds) {
    let startTick = round.freeze_time_end_tick + Math.round(startSeconds * tickrate);
    let endTick = endSeconds === null ? null : round.freeze_time_end_tick + Math.round(endSeconds * tickrate);
    const plantTick = plantTickPerRound.get(round.number);
    if (filters.plantPhase === BombPlantPhase.PostPlant) {
      if (plantTick === undefined) {
        continue;
      }
      startTick = Math.max(startTick, plantTick);
    } else if (filters.plantPhase === BombPlantPhase.PrePlant && plantTick !== undefined) {
      endTick = endTick === null ? plantTick - 1 : Math.min(endTick, plantTick - 1);
    }
    tickWindows.set(round.number, { startTick, endTick });
  }

  return tickWindows;
}

export async function fetchMatchPositionsPoints(filters: MatchHeatmapFilter): Promise<Point[]> {
  const demo = await db
    .selectFrom('demos')
    .select('tickrate')
    .where('checksum', '=', filters.checksum)
    .executeTakeFirst();
  if (demo === undefined) {
    return [];
  }

  const tickWindows = await fetchRoundsTickWindows(filters, demo.tickrate);
  if (tickWindows.size === 0) {
    return [];
  }

  let query = db
    .selectFrom('player_position_samples')
    .select([
      'player_position_samples.round_number',
      'player_position_samples.ticks',
      'player_position_samples.x',
      'player_position_samples.y',
      'player_position_samples.z',
    ])
    .where('player_position_samples.match_checksum', '=', filters.checksum)
    .where('player_position_samples.round_number', 'in', [...tickWindows.keys()]);

  if (filters.sides.length > 0) {
    query = query.where('player_position_samples.side', 'in', filters.sides);
  }
  if (filters.steamIds.length > 0) {
    query = query.where('player_position_samples.player_steam_id', 'in', filters.steamIds);
  }
  if (filters.teamNames.length > 0) {
    query = query
      .innerJoin('players', (join) => {
        return join
          .onRef('players.match_checksum', '=', 'player_position_samples.match_checksum')
          .onRef('players.steam_id', '=', 'player_position_samples.player_steam_id');
      })
      .where('players.team_name', 'in', filters.teamNames);
  }

  const rows = await query.execute();
  // Maps without a lower level have a threshold of 0, it means no threshold like in the other heatmap queries.
  const thresholdZ = filters.thresholdZ || null;
  const points: Point[] = [];
  for (const row of rows) {
    const tickWindow = tickWindows.get(row.round_number);
    if (tickWindow === undefined) {
      continue;
    }
    points.push(
      ...readPositionSamplePoints(row, {
        startTick: tickWindow.startTick,
        endTick: tickWindow.endTick,
        thresholdZ,
        radarLevel: filters.radarLevel,
      }),
    );
  }

  return points;
}
