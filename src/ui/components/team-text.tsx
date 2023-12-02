import React from 'react';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';

type Props = {
  children: React.ReactNode;
  teamNumber: TeamNumber;
  className?: string;
};

export function TeamText({ children, teamNumber, className }: Props) {
  return (
    <span
      className={className}
      style={{
        color: getTeamColor(teamNumber),
      }}
    >
      {children}
    </span>
  );
}
