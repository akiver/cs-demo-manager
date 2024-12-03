import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CopyButton } from './copy-button';

type Props = {
  steamId: string;
};

export function CopySteamIdButton({ steamId }: Props) {
  return (
    <CopyButton data={steamId}>
      <Trans>Copy SteamID</Trans>
    </CopyButton>
  );
}
