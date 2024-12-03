import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';

type Props = {
  isDisabled: boolean;
  getApplicationFolderPath: () => Promise<string>;
};

export function SoftwareBrowseButton({ isDisabled, getApplicationFolderPath }: Props) {
  return (
    <Button
      onClick={async () => {
        const applicationPath = await getApplicationFolderPath();
        window.csdm.browseToFile(applicationPath);
      }}
      isDisabled={isDisabled}
    >
      <Trans context="Button">Browse</Trans>
    </Button>
  );
}
