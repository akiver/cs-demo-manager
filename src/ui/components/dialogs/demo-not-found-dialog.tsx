import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter } from 'csdm/ui/dialogs/dialog';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';

type Props = {
  demoPath: string;
};

export function DemoNotFoundDialog({ demoPath }: Props) {
  const { hideDialog } = useDialog();

  return (
    <Dialog>
      <DialogContent>
        <p>
          <Trans>Demo not found.</Trans>
        </p>
        <p>{demoPath}</p>
      </DialogContent>
      <DialogFooter>
        <CloseButton onClick={hideDialog} />
      </DialogFooter>
    </Dialog>
  );
}
