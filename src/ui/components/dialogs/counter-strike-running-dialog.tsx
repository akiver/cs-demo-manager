import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ConfirmDialog } from 'csdm/ui/dialogs/confirm-dialog';

type Props = {
  onConfirmClick: () => void;
  closeOnConfirm?: boolean;
};

export function CounterStrikeRunningDialog({ onConfirmClick, closeOnConfirm = true }: Props) {
  return (
    <ConfirmDialog
      title={<Trans>Counter-Strike is running</Trans>}
      onConfirm={onConfirmClick}
      closeOnConfirm={closeOnConfirm}
    >
      <p>
        <Trans>Counter-Strike is running.</Trans>
      </p>
      <p>
        <Trans>Do you want to close the game and continue?</Trans>
      </p>
    </ConfirmDialog>
  );
}
