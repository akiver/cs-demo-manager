import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function SaveButton({ onClick, isDisabled = false }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled} variant={ButtonVariant.Primary}>
      <Trans context="Button">Save</Trans>
    </Button>
  );
}
