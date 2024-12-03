import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function ResetButton({ onClick, isDisabled }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">Reset</Trans>
    </Button>
  );
}
