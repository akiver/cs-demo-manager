import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
  isDisabled?: boolean;
  variant?: ButtonVariant;
  type?: 'button' | 'submit';
  form?: string;
};

export function UpdateButton({ onClick, isDisabled = false, variant = ButtonVariant.Primary, ...props }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled} variant={variant} {...props}>
      <Trans context="Button">Update</Trans>
    </Button>
  );
}
