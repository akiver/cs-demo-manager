import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';

type Props = {
  children: ReactNode;
};

export function AddVideoToQueueErrorDialog({ children }: Props) {
  const { hideDialog } = useDialog();

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>
          <Trans context="Dialog title">Error</Trans>
        </DialogTitle>
      </DialogHeader>
      <DialogContent>{children}</DialogContent>
      <DialogFooter>
        <CloseButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
