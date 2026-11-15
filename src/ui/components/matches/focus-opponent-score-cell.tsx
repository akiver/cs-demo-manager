import React from 'react';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { getTeamScoreClassName } from 'csdm/ui/styles/get-team-score-class-name';
import { getFocusScores } from './matches-focus';
import { useMatchesFocus } from './matches-focus-context';

type Props = CellProps<MatchTable>;

export function FocusOpponentScoreCell({ data: match }: Props) {
  const focus = useMatchesFocus();
  const scores = getFocusScores(match, focus);
  if (scores === undefined) {
    return null;
  }

  return <div className={getTeamScoreClassName(scores.opponentScore, scores.score)}>{scores.opponentScore}</div>;
}
