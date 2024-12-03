import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
};

export function RetryButton({ onClick }: Props) {
  return (
    <Button onClick={onClick}>
      <Trans context="Button">Retry</Trans>
    </Button>
  );
}
