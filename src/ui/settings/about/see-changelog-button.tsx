import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ChangelogDialog } from 'csdm/ui/changelog/changelog-dialog';

export function SeeChangelogButton() {
  const { showDialog } = useDialog();

  const onClick = () => {
    showDialog(<ChangelogDialog />);
  };

  return (
    <Button onClick={onClick}>
      <Trans context="Button">See Changelog</Trans>
    </Button>
  );
}
