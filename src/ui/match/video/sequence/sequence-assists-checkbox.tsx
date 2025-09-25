import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { AssistsCheckbox } from '../assists-checkbox';

export function SequenceAssistsCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();

  return (
    <AssistsCheckbox
      defaultChecked={sequence.showAssists}
      onChange={(isChecked) => {
        updateSequence({
          showAssists: isChecked,
        });
      }}
    />
  );
}
