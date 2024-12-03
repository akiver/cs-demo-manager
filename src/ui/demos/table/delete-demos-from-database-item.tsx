import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  onClick: () => void;
};

export function DeleteDemosFromDatabaseItem({ onClick }: Props) {
  return (
    <ContextMenuItem onClick={onClick}>
      <Trans>Delete from database</Trans>
    </ContextMenuItem>
  );
}
