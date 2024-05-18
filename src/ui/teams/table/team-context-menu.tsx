import React from 'react';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { NavigateToPlayerItem } from 'csdm/ui/components/context-menu/items/navigate-to-player-item';
import { CopyNameItem } from 'csdm/ui/components/context-menu/items/copy-name-item';

type Props = {
  teamNames: string[];
};

export function TeamContextMenu({ teamNames }: Props) {
  if (teamNames.length === 0) {
    return null;
  }
  const selectedTeamName = teamNames[teamNames.length - 1];

  return (
    <ContextMenu>
      <NavigateToPlayerItem steamId={selectedTeamName} />
      <CopyNameItem names={teamNames} />
    </ContextMenu>
  );
}
