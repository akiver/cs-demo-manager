import React from 'react';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { TeamText } from 'csdm/ui/components/team-text';

type Props = {
  score: number;
  teamNumber?: TeamNumber;
};

export function MatchScore({ score, teamNumber }: Props) {
  if (teamNumber === undefined) {
    return <p className="text-body-strong">{score}</p>;
  }

  return (
    <TeamText className="text-body-strong" teamNumber={teamNumber}>
      {score}
    </TeamText>
  );
}
