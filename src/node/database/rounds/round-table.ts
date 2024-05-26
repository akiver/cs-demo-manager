import type { Generated, Selectable } from 'kysely';
import type { EconomyType, RoundEndReason, TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type RoundTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  number: number;
  start_tick: number;
  start_frame: number;
  freeze_time_end_tick: number;
  freeze_time_end_frame: number;
  end_tick: number;
  end_frame: number;
  end_officially_tick: number;
  end_officially_frame: number;
  team_a_name: string;
  team_b_name: string;
  team_a_score: number;
  team_b_score: number;
  team_b_side: TeamNumber;
  team_a_side: TeamNumber;
  team_a_start_money: number;
  team_b_start_money: number;
  team_a_equipment_value: number;
  team_b_equipment_value: number;
  team_a_money_spent: number;
  team_b_money_spent: number;
  team_a_economy_type: EconomyType;
  team_b_economy_type: EconomyType;
  duration: number;
  end_reason: RoundEndReason;
  winner_name: string;
  winner_side: TeamNumber;
  overtime_number: number;
};

export type RoundRow = Selectable<RoundTable>;
