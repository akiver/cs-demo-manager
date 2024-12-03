import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  nickname: string;
};

export function OpenFaceitProfileItem({ nickname }: Props) {
  const onClick = () => {
    window.open(`https://www.faceit.com/en/players/${nickname}`, '_blank');
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Open FACEIT profile</Trans>
    </ContextMenuItem>
  );
}
