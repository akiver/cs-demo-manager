import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, ButtonVariant, type Props } from 'csdm/ui/components/buttons/button';

export function ConfirmButton(props: Omit<Props, 'variant' | 'children'>) {
  return (
    <Button variant={ButtonVariant.Primary} {...props}>
      <Trans context="Button">Confirm</Trans>
    </Button>
  );
}
