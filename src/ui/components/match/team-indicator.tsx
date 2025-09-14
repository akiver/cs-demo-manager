import React from 'react';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { getTeamColor } from 'csdm/ui/styles/get-team-color';

type Props = {
  teamNumber: TeamNumber;
};

export function TeamIndicator({ teamNumber }: Props) {
  const color = getTeamColor(teamNumber);

  return (
    <div
      className="flex size-8 self-center rounded-full"
      style={{
        backgroundColor: color,
      }}
    />
  );
}
