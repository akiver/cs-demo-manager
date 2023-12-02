import type { Generated, Insertable, Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type FaceitMatchPlayerTable = {
  id: Generated<ColumnID>;
  faceit_id: string;
  name: string;
  avatar_url: string;
  team_id: string;
  team_name: string;
  kill_count: number;
  assist_count: number;
  death_count: number;
  headshot_count: number;
  headshot_percentage: number;
  kill_death_ratio: number;
  kill_per_round: number;
  mvp_count: number;
  three_kill_count: number;
  four_kill_count: number;
  five_kill_count: number;
  faceit_match_id: string;
};

export type FaceitMatchPlayerRow = Selectable<FaceitMatchPlayerTable>;
export type InsertableFaceitMatchPlayer = Insertable<FaceitMatchPlayerTable>;
