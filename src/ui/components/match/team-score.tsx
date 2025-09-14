import React from 'react';
import clsx from 'clsx';
import { getTeamScoreClassName } from 'csdm/ui/styles/get-team-score-class-name';

type Props = {
  teamName: string;
  teamScore: number;
  scoreOppositeTeam: number;
};

export function TeamScore({ teamName, teamScore, scoreOppositeTeam }: Props) {
  return (
    <div className="flex items-center">
      <p className={clsx('text-title', getTeamScoreClassName(teamScore, scoreOppositeTeam))}>{teamScore}</p>
      <p className="ml-4 text-body-strong">{teamName}</p>
    </div>
  );
}
