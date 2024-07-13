import React from 'react';
import { Trans } from '@lingui/macro';
import { Button, type ButtonVariant } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
  isDisabled: boolean;
  variant: ButtonVariant;
};

export function UpdateButton({ onClick, isDisabled, variant }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled} variant={variant}>
      <Trans context="Button">Update</Trans>
    </Button>
  );
}
