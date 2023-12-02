import type { TeamRow } from './team-table';
import type { Team } from 'csdm/common/types/team';

export function teamRowToTeam(row: TeamRow): Team {
  return {
    currentSide: row.current_side,
    id: row.id,
    letter: row.letter,
    matchChecksum: row.match_checksum,
    name: row.name,
    score: row.score,
    scoreFirstHalf: row.score_first_half,
    scoreSecondHalf: row.score_second_half,
  };
}
