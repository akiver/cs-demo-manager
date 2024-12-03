import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ExportMatchesAsXlsxDialog } from 'csdm/ui/components/dialogs/export-matches-xlsx-dialog';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Button } from 'csdm/ui/components/buttons/button';

export function ExportMatchAsXlsxButton() {
  const match = useCurrentMatch();
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ExportMatchesAsXlsxDialog matches={[match]} />);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">XLSX export</Trans>
    </Button>
  );
}
