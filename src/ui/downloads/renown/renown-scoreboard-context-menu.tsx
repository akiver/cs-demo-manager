import React from 'react';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { OpenRenownProfileItem } from 'csdm/ui/components/context-menu/items/open-renown-profile-item';
import { OpenLeetifyProfileItem } from 'csdm/ui/components/context-menu/items/open-leetify-profile-item';

type Props = {
  steamId: string;
};

export function RenownScoreboardContextMenu({ steamId }: Props) {
  return (
    <ContextMenu>
      <OpenRenownProfileItem steamId={steamId} />
      <OpenLeetifyProfileItem steamId={steamId} />
    </ContextMenu>
  );
}
