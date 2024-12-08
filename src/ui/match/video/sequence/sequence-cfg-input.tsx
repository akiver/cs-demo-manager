import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useSequenceForm } from './use-sequence-form';
import { CfgInput } from '../cfg-input';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';

export function SequenceCfgInput() {
  const { sequence, updateSequence } = useSequenceForm();
  const onBlur = (event: React.FocusEvent) => {
    const input = event.target as HTMLInputElement;
    updateSequence({
      cfg: input.value,
    });
  };

  return (
    <div className="flex flex-col gap-y-8 w-[300px]">
      <InputLabel htmlFor="cfg">
        <Trans context="Input label">CFG</Trans>
      </InputLabel>
      <CfgInput cfg={sequence.cfg} onBlur={onBlur} />
    </div>
  );
}
