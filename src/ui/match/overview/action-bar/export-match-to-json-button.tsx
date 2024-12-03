import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { Button } from 'csdm/ui/components/buttons/button';
import { ExportMatchesToJsonDialog } from 'csdm/ui/components/dialogs/export-matches-to-json-dialog';

export function ExportMatchToJsonButton() {
  const match = useCurrentMatch();
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ExportMatchesToJsonDialog checksums={[match.checksum]} />);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">JSON export</Trans>
    </Button>
  );
}
