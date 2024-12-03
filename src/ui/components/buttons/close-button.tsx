import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';

type Props = {
  onClick: () => void;
  isDisabled?: boolean;
};

export function CloseButton(props: Props) {
  return (
    <Button {...props}>
      <Trans context="Button">Close</Trans>
    </Button>
  );
}
