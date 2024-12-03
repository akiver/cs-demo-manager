import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from './button';

type Props = {
  data: string;
  isDisabled?: boolean;
  children?: React.ReactNode;
};

export function CopyButton({ data, children, isDisabled }: Props) {
  return (
    <Button
      isDisabled={isDisabled}
      onClick={() => {
        navigator.clipboard.writeText(data);
      }}
    >
      {children ? children : <Trans context="Button">Copy</Trans>}
    </Button>
  );
}
