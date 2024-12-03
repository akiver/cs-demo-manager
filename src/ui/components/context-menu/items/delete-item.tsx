import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  onClick: () => void;
};

export function DeleteItem({ onClick }: Props) {
  return (
    <ContextMenuItem onClick={onClick}>
      <p>
        <Trans context="Context menu">Delete</Trans>
      </p>
      <p className="text-caption">⟵</p>
    </ContextMenuItem>
  );
}
