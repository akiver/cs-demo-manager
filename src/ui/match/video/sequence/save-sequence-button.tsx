import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'csdm/ui/dialogs/dialog';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { SaveButton } from 'csdm/ui/components/buttons/save-button';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import type { SequenceForm } from './sequence-form';
import { useSequenceForm } from './use-sequence-form';
import { useCurrentMatchSequences } from '../sequences/use-current-match-sequences';

type Props = {
  onClick: (sequence: SequenceForm) => void;
  closeDialog: () => void;
};

export function SaveSequenceButton({ onClick, closeDialog }: Props) {
  const { showDialog, hideDialog } = useDialog();
  const { sequence, initialNumber } = useSequenceForm();
  const sequences = useCurrentMatchSequences();

  const showErrorDialog = (message: ReactNode) => {
    showDialog(
      <Dialog>
        <DialogHeader>
          <DialogTitle>
            <Trans context="Dialog title">Error</Trans>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>{message}</DialogContent>
        <DialogFooter>
          <CloseButton onClick={hideDialog} />
        </DialogFooter>
      </Dialog>,
    );
  };

  const handleClick = () => {
    const { number, startTick, endTick } = sequence;
    if (Number(endTick) <= Number(startTick)) {
      showErrorDialog(<Trans>End tick must be greater than start tick</Trans>);
      return;
    }

    const sequenceNumber = Number(number);
    if (!Number.isInteger(sequenceNumber) || sequenceNumber < 1) {
      showErrorDialog(<Trans>Sequence number must be greater than 0</Trans>);
      return;
    }

    const isNumberAlreadyUsed = sequences.some((sequence) => {
      return sequence.number === sequenceNumber && sequence.number !== initialNumber;
    });
    if (isNumberAlreadyUsed) {
      showErrorDialog(<Trans>A sequence with the number {sequenceNumber} already exists</Trans>);
      return;
    }

    closeDialog();
    onClick(sequence);
  };

  return <SaveButton onClick={handleClick} />;
}
