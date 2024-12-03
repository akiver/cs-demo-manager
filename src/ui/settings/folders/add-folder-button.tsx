import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useAddFolder } from './use-add-folder';

export function AddFolderButton() {
  const addFolder = useAddFolder();

  return (
    <Button onClick={addFolder} variant={ButtonVariant.Primary}>
      <Trans context="Button">Add a folder</Trans>
    </Button>
  );
}
