import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';

type Props = {
  isDisabled: boolean;
  onClick: () => void;
};

export function RefreshButton({ isDisabled, onClick }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">Refresh</Trans>
    </Button>
  );
}
