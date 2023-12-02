import React from 'react';
import { Trans } from '@lingui/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  onClick: () => void;
};

export function DetailsItem({ onClick }: Props) {
  return (
    <ContextMenuItem onClick={onClick}>
      <p>
        <Trans context="Context menu">Details</Trans>
      </p>
      <p className="text-caption">{window.csdm.isMac ? '⌘+↓' : 'Enter'}</p>
    </ContextMenuItem>
  );
}
