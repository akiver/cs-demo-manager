import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  steamId: string;
};

export function OpenLeetifyProfileItem({ steamId }: Props) {
  const onClick = () => {
    window.open(`https://leetify.com/app/profile/${steamId}`, '_blank');
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Open Leetify profile</Trans>
    </ContextMenuItem>
  );
}
