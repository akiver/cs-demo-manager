import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useNavigateToPlayer } from 'csdm/ui/hooks/use-navigate-to-player';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  steamId: string;
};

export function SeePlayerProfileItem({ steamId }: Props) {
  const navigateToPlayer = useNavigateToPlayer();

  const onClick = () => {
    navigateToPlayer(steamId);
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">See profile</Trans>
    </ContextMenuItem>
  );
}
