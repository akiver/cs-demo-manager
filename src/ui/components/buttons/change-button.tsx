import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function ChangeButton({ onClick, isDisabled }: Props) {
  return (
    <Button onClick={onClick} isDisabled={isDisabled}>
      <Trans context="Button">Change</Trans>
    </Button>
  );
}
