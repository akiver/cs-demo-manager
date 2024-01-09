import React from 'react';
import { Trans } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';
import { useSequenceForm } from './use-sequence-form';

export function SequenceXRayCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();

  return (
    <div className="flex gap-x-8">
      <Checkbox
        id="x-ray"
        defaultChecked={sequence.showXRay}
        onChange={(event) => {
          updateSequence({
            showXRay: event.target.checked,
          });
        }}
      />
      <InputLabel htmlFor="x-ray">
        <Trans context="Input label">Show X-Ray</Trans>
      </InputLabel>
    </div>
  );
}
