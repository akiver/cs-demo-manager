import type { Round } from 'csdm/common/types/round';
import type { RoundRow } from 'csdm/node/database/rounds/round-table';

export function roundRowToRound(row: RoundRow, tagIds: string[]): Round {
  return {
    id: row.id,
    number: row.number,
    startTick: row.start_tick,
    endTick: row.end_tick,
    endOfficiallyTick: row.end_officially_tick,
    startFrame: row.start_frame,
    endFrame: row.end_frame,
    endOfficiallyFrame: row.end_officially_frame,
    freezetimeEndFrame: row.freeze_time_end_frame,
    endReason: row.end_reason,
    duration: row.duration,
    freezetimeEndTick: row.freeze_time_end_tick,
    matchChecksum: row.match_checksum,
    teamAScore: row.team_a_score,
    teamBScore: row.team_b_score,
    teamASide: row.team_a_side,
    teamBSide: row.team_b_side,
    winnerSide: row.winner_side,
    winnerTeamName: row.winner_name,
    teamAStartMoney: row.team_a_start_money,
    teamBStartMoney: row.team_b_start_money,
    teamAMoneySpent: row.team_a_money_spent,
    teamBMoneySpent: row.team_b_money_spent,
    teamAEquipmentValue: row.team_a_equipment_value,
    teamBEquipmentValue: row.team_b_equipment_value,
    teamAEconomyType: row.team_a_economy_type,
    teamBEconomyType: row.team_b_economy_type,
    tagIds,
  };
}
