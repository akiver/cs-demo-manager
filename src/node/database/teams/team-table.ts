import type { Generated, Selectable } from 'kysely';
import type { TeamLetter, TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type TeamTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  current_side: TeamNumber;
  name: string;
  letter: TeamLetter;
  score: number;
  score_first_half: number;
  score_second_half: number;
};

export type TeamRow = Selectable<TeamTable>;
