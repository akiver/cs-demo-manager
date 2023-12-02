import React from 'react';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { getTeamScoreClassName } from 'csdm/ui/styles/get-team-score-class-name';

type Props = CellProps<MatchTable>;

export function TeamBScoreCell({ data: match }: Props) {
  return <div className={getTeamScoreClassName(match.teamBScore, match.teamAScore)}>{match.teamBScore}</div>;
}
