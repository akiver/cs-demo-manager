import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { XRayCheckbox } from '../x-ray-checkbox';

export function SequenceXRayCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();

  return (
    <XRayCheckbox
      defaultChecked={sequence.showXRay}
      onChange={(isChecked) => {
        updateSequence({
          showXRay: isChecked,
        });
      }}
    />
  );
}
