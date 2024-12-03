import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from './button';

type Props = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function SeeDemoButton({ onClick, isDisabled }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">See demo</Trans>
    </Button>
  );
}
