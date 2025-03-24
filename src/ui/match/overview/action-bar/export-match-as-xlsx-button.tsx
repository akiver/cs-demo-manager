import React from 'react';
import { ExportMatchesAsXlsxDialog } from 'csdm/ui/components/dialogs/export-matches-xlsx-dialog';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { XlsxExportButton } from 'csdm/ui/components/buttons/xlsx-export-button';

export function ExportMatchAsXlsxButton() {
  const match = useCurrentMatch();
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ExportMatchesAsXlsxDialog matches={[match]} />);
  };

  return <XlsxExportButton onClick={onClick} />;
}
