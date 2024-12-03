import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SpinnableButton } from 'csdm/ui/components/buttons/spinnable-button';

type Props = {
  isLoading: boolean;
  onClick: () => void;
};

export function ConnectDatabaseButton({ isLoading, onClick }: Props) {
  return (
    <SpinnableButton onClick={onClick} isLoading={isLoading}>
      <Trans context="Button">Connect</Trans>
    </SpinnableButton>
  );
}
