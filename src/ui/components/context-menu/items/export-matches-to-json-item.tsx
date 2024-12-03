import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { useDialog } from '../../dialogs/use-dialog';
import { ExportMatchesToJsonDialog } from '../../dialogs/export-matches-to-json-dialog';

type Props = {
  checksums: string[];
};

export function ExportMatchesToJsonItem({ checksums }: Props) {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ExportMatchesToJsonDialog checksums={checksums} />);
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">JSON</Trans>
    </ContextMenuItem>
  );
}
