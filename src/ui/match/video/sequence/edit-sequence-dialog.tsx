import React from 'react';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { Sequence } from 'csdm/common/types/sequence';
import { SequenceDialog } from './sequence-dialog';
import { updateSequence } from '../sequences/sequences-actions';
import type { SequenceForm } from './sequence-form';

type Props = {
  sequence: Sequence;
  closeDialog: () => void;
};

export function EditSequenceDialog({ closeDialog, sequence }: Props) {
  const dispatch = useDispatch();
  const match = useCurrentMatch();

  const onSaveClick = (sequenceForm: SequenceForm) => {
    const updatedSequence: Sequence = {
      ...sequenceForm,
      number: Number(sequenceForm.number),
      startTick: Number(sequenceForm.startTick),
      endTick: Number(sequenceForm.endTick),
    };
    dispatch(
      updateSequence({
        demoFilePath: match.demoFilePath,
        sequence: updatedSequence,
        previousNumber: sequence.number,
      }),
    );
  };

  return (
    <SequenceDialog
      initialSequence={sequence}
      isVisible={sequence !== undefined}
      closeDialog={closeDialog}
      onSaveClick={onSaveClick}
    />
  );
}
