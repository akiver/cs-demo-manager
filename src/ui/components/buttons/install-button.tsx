import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SpinnableButton } from './spinnable-button';

type Props = {
  onClick: () => void;
  isDisabled: boolean;
  isInstalling: boolean;
};

export function InstallButton({ onClick, isDisabled, isInstalling }: Props) {
  return (
    <SpinnableButton onClick={onClick} isDisabled={isDisabled} isLoading={isInstalling}>
      <Trans context="Button">Install</Trans>
    </SpinnableButton>
  );
}
