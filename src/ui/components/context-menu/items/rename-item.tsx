import React from 'react';
import { Trans } from '@lingui/macro';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  onClick: () => void;
};

export function RenameItem({ onClick }: Props) {
  return (
    <ContextMenuItem onClick={onClick}>
      <p>
        <Trans context="Context menu">Rename</Trans>
      </p>
      <p className="text-caption">{window.csdm.isMac ? 'Enter' : 'F2'}</p>
    </ContextMenuItem>
  );
}
