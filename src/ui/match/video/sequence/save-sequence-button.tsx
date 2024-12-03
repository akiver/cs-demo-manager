import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter } from 'csdm/ui/dialogs/dialog';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { SaveButton } from 'csdm/ui/components/buttons/save-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import type { SequenceForm } from './sequence-form';
import { useSequenceForm } from './use-sequence-form';

type Props = {
  onClick: (sequence: SequenceForm) => void;
  closeDialog: () => void;
};

export function SaveSequenceButton({ onClick, closeDialog }: Props) {
  const { showDialog, hideDialog } = useDialog();
  const { sequence } = useSequenceForm();

  const handleClick = () => {
    const { startTick, endTick } = sequence;
    if (Number(endTick) <= Number(startTick)) {
      showDialog(
        <Dialog>
          <DialogContent>
            <Trans>End tick must be greater than start tick</Trans>
          </DialogContent>
          <DialogFooter>
            <CloseButton onClick={hideDialog} />
          </DialogFooter>
        </Dialog>,
      );
    } else {
      closeDialog();
      onClick(sequence);
    }
  };

  return <SaveButton onClick={handleClick} />;
}
