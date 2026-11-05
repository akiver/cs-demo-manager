import { expressionBuilder, type Expression, type SqlBool } from 'kysely';
import { BombPlantPhase } from 'csdm/common/types/bomb-plant-phase';
import type { MatchHeatmapFilter } from 'csdm/common/types/heatmap-filters';
import type { Database } from 'csdm/node/database/schema';

type Table = 'kills' | 'shots' | 'grenade_projectiles_destroy';

// Builds the WHERE conditions restricting heatmap points to a round time window and/or a bomb plant phase.
export function buildMatchHeatmapTimeConditions(filters: MatchHeatmapFilter, table: Table): Expression<SqlBool>[] {
  const eb = expressionBuilder<Database, Table>();
  const conditions: Expression<SqlBool>[] = [];
  const matchChecksum = `${table}.match_checksum` as const;
  const roundNumber = `${table}.round_number` as const;
  const tick = `${table}.tick` as const;

  const { startSeconds, endSeconds } = filters.timeRange;
  if (startSeconds > 0 || endSeconds !== null) {
    let roundsQuery = eb
      .selectFrom('rounds')
      .innerJoin('demos', 'demos.checksum', 'rounds.match_checksum')
      .select('rounds.id')
      .whereRef('rounds.match_checksum', '=', matchChecksum)
      .whereRef('rounds.number', '=', roundNumber)
      .where((eb) => {
        return eb(tick, '>=', eb('rounds.freeze_time_end_tick', '+', eb('demos.tickrate', '*', startSeconds)));
      });
    if (endSeconds !== null) {
      roundsQuery = roundsQuery.where((eb) => {
        return eb(tick, '<=', eb('rounds.freeze_time_end_tick', '+', eb('demos.tickrate', '*', endSeconds)));
      });
    }
    conditions.push(eb.exists(roundsQuery));
  }

  if (filters.plantPhase !== null) {
    const hasBombBeenPlanted = eb.exists(
      eb
        .selectFrom('bombs_planted')
        .select('bombs_planted.id')
        .whereRef('bombs_planted.match_checksum', '=', matchChecksum)
        .whereRef('bombs_planted.round_number', '=', roundNumber)
        .whereRef('bombs_planted.tick', '<=', tick),
    );
    conditions.push(filters.plantPhase === BombPlantPhase.PostPlant ? hasBombBeenPlanted : eb.not(hasBombBeenPlanted));
  }

  return conditions;
}
