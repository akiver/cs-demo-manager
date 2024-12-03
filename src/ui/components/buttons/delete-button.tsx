import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant } from './button';

type Props = {
  onClick: () => void;
};

export function DeleteButton({ onClick }: Props) {
  return (
    <Button onClick={onClick} variant={ButtonVariant.Danger}>
      <Trans context="Button">Delete</Trans>
    </Button>
  );
}
