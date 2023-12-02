import type { Generated, Insertable, Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type FaceitMatchTeamTable = {
  id: Generated<ColumnID>;
  faceit_id: string;
  name: string;
  score: number;
  first_half_score: number;
  second_half_score: number;
  overtime_score: number;
  faceit_match_id: string;
};

export type FaceitMatchTeamRow = Selectable<FaceitMatchTeamTable>;
export type InsertableFaceitMatchTeam = Insertable<FaceitMatchTeamTable>;
