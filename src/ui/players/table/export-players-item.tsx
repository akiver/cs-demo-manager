import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { ExportToXlsxItem } from 'csdm/ui/components/context-menu/items/export-to-xlsx-item';
import { ExportPlayersToXlsxDialog } from './export-players-to-xlsx-dialog';

type Props = {
  steamIds: string[];
};

export function ExportPlayersItem({ steamIds }: Props) {
  const { showDialog } = useDialog();

  if (steamIds.length === 0) {
    return null;
  }

  const onExportToXlsxClick = () => {
    showDialog(<ExportPlayersToXlsxDialog steamIds={steamIds} />);
  };

  return (
    <SubContextMenu label={<Trans context="Context menu">Export</Trans>}>
      <ExportToXlsxItem onClick={onExportToXlsxClick} />
    </SubContextMenu>
  );
}
