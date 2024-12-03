import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  onClick: () => void;
};

export function UpdateNameItem({ onClick }: Props) {
  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Update name</Trans>
    </ContextMenuItem>
  );
}
