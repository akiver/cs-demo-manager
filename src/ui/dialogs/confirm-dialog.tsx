import React from 'react';
import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { SpinnableButton } from '../components/buttons/spinnable-button';
import { CancelButton } from 'csdm/ui/components/buttons/cancel-button';
import type { ButtonVariant } from 'csdm/ui/components/buttons/button';
import { useDialog } from '../components/dialogs/use-dialog';

type Props = {
  title: ReactNode;
  onConfirm: () => void;
  children: ReactNode;
  isBusy?: boolean;
  isConfirmButtonDisabled?: boolean;
  confirmButtonVariant?: ButtonVariant;
  blockNavigation?: boolean;
  closeOnConfirm?: boolean;
};

export function ConfirmDialog({
  title,
  onConfirm,
  children,
  isBusy = false,
  blockNavigation = true,
  isConfirmButtonDisabled,
  confirmButtonVariant,
  closeOnConfirm = true,
}: Props) {
  const { hideDialog } = useDialog();

  const handleConfirm = () => {
    onConfirm();
    if (closeOnConfirm) {
      hideDialog();
    }
  };

  const onEnterKeyPressed = () => {
    if (!isBusy && !isConfirmButtonDisabled) {
      handleConfirm();
    }
  };

  return (
    <Dialog
      onClose={hideDialog}
      closeOnBackgroundClicked={!isBusy}
      closeOnEscPressed={!isBusy}
      blockNavigation={blockNavigation}
      onEnterPressed={onEnterKeyPressed}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogContent>{children}</DialogContent>
      <DialogFooter>
        <SpinnableButton
          onClick={handleConfirm}
          isLoading={isBusy}
          isDisabled={isConfirmButtonDisabled}
          variant={confirmButtonVariant}
        >
          <Trans context="Button">Confirm</Trans>
        </SpinnableButton>
        <CancelButton onClick={hideDialog} isDisabled={isBusy} />
      </DialogFooter>
    </Dialog>
  );
}
