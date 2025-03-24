import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from './button';

type Props = {
  onClick: () => void;
};

export function XlsxExportButton({ onClick }: Props) {
  return (
    <Button onClick={onClick}>
      <Trans context="Button">XLSX export</Trans>
    </Button>
  );
}
