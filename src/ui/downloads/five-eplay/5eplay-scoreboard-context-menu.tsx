import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  domainId: string;
};

export function FiveEPlayScoreboardContextMenu({ domainId }: Props) {
  const onOpenClick = () => {
    window.open(`https://arena.5eplay.com/data/player/${domainId}`, '_blank');
  };
  return (
    <ContextMenu>
      <ContextMenuItem onClick={onOpenClick}>
        <Trans context="Context menu">Open 5EPlay profile</Trans>
      </ContextMenuItem>
    </ContextMenu>
  );
}
