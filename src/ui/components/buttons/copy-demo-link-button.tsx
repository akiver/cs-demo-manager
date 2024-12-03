import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CopyButton } from './copy-button';

type Props = {
  link: string;
};

export function CopyDemoLinkButton({ link }: Props) {
  return (
    <CopyButton data={link}>
      <Trans context="Button">Copy demo link</Trans>
    </CopyButton>
  );
}
