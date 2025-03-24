import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';

type Props = {
  onClick: () => void;
};

export function ExportToXlsxItem({ onClick }: Props) {
  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">XLSX</Trans>
    </ContextMenuItem>
  );
}
