import React from 'react';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { OpenFaceitProfileItem } from 'csdm/ui/components/context-menu/items/open-faceit-profile-item';

type Props = {
  playerNickname: string;
};

export function FaceitScoreboardContextMenu({ playerNickname }: Props) {
  return (
    <ContextMenu>
      <OpenFaceitProfileItem nickname={playerNickname} />
    </ContextMenu>
  );
}
