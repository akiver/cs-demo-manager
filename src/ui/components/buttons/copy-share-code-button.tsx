import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CopyButton } from './copy-button';

type Props = {
  shareCode: string;
};

export function CopyShareCodeButton({ shareCode }: Props) {
  if (shareCode === '') {
    return null;
  }

  return (
    <CopyButton data={shareCode}>
      <Trans context="Button">Copy share code</Trans>
    </CopyButton>
  );
}
