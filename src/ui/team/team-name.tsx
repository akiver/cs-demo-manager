import React from 'react';
import { useUnsafeTeam } from './use-unsafe-team';
import { TeamIcon } from 'csdm/ui/icons/team-icon';

export function TeamName() {
  const team = useUnsafeTeam();

  if (!team) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-4">
      <TeamIcon className="size-24" />
      <p className="text-body-strong">{team.name}</p>
    </div>
  );
}
