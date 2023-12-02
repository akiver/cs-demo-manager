import React from 'react';
import { Trans } from '@lingui/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function ApplyButton({ onClick, isDisabled }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled} variant={ButtonVariant.Primary}>
      <Trans context="Button">Apply</Trans>
    </Button>
  );
}
