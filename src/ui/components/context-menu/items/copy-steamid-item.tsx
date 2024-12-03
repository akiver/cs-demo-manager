import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useClipboard } from 'csdm/ui/hooks/use-clipboard';

type Props = {
  steamIds: string[];
  children?: ReactNode;
};

export function CopySteamIdItem({ steamIds, children }: Props) {
  const { copyToClipboard } = useClipboard();

  const onClick = () => {
    copyToClipboard(steamIds.join(','));
  };

  return (
    <ContextMenuItem onClick={onClick}>
      {children ? children : <Trans context="Context menu">Copy Steam ID</Trans>}
    </ContextMenuItem>
  );
}
