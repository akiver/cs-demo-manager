import React from 'react';
import { useLingui } from '@lingui/react/macro';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { CellProps } from 'csdm/ui/components/table/table-types';
import { getTeamScoreClassName } from 'csdm/ui/styles/get-team-score-class-name';
import { getFocusScores } from './matches-focus';
import { useMatchesFocus } from './matches-focus-context';

type Props = CellProps<MatchTable>;

export function FocusResultCell({ data: match }: Props) {
  const { t } = useLingui();
  const focus = useMatchesFocus();
  const scores = getFocusScores(match, focus);
  if (scores === undefined) {
    return null;
  }

  const { score, opponentScore } = scores;
  let result: string;
  if (score === opponentScore) {
    result = t({ context: 'Match result tie', message: 'T' });
  } else if (score > opponentScore) {
    result = t({ context: 'Match result win', message: 'W' });
  } else {
    result = t({ context: 'Match result loss', message: 'L' });
  }

  return <div className={getTeamScoreClassName(score, opponentScore)}>{result}</div>;
}
