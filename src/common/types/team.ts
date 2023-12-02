import type { TeamLetter, TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type Team = {
  id: ColumnID;
  matchChecksum: string;
  currentSide: TeamNumber;
  name: string;
  letter: TeamLetter;
  score: number;
  scoreFirstHalf: number;
  scoreSecondHalf: number;
};
