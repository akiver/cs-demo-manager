import React from 'react';
import { Trans } from '@lingui/macro';
import { Button } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
  isDisabled: boolean;
};

export function UpdateButton({ onClick, isDisabled }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">Update</Trans>
    </Button>
  );
}
