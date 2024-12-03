import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useSequenceForm } from './use-sequence-form';

export function StartTickInput() {
  const { t } = useLingui();
  const { sequence, updateSequence } = useSequenceForm();

  const onBlur = (event: React.FocusEvent) => {
    const input = event.target as HTMLInputElement;
    if (Number.isNaN(Number.parseInt(input.value))) {
      updateSequence({
        startTick: '1',
      });
    }
  };

  const onChange = (event: React.ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    updateSequence({
      startTick: input.value,
    });
  };

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor="start-tick">
        <Trans context="Input label">Start tick</Trans>
      </InputLabel>
      <InputNumber
        id="start-tick"
        min={1}
        placeholder={t({
          context: 'Input placeholder',
          message: 'Start tick',
        })}
        value={sequence.startTick}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}
