import React, { useId } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useSequenceForm } from './use-sequence-form';

export function SequenceNumberInput() {
  const id = useId();
  const { t } = useLingui();
  const { sequence, initialNumber, updateSequence } = useSequenceForm();

  const onBlur = (event: React.FocusEvent) => {
    const input = event.target as HTMLInputElement;
    if (Number.isNaN(Number.parseInt(input.value))) {
      updateSequence({
        number: String(initialNumber),
      });
    }
  };

  const onChange = (event: React.ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    updateSequence({
      number: input.value,
    });
  };

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor={id}>
        <Trans context="Input label">Number</Trans>
      </InputLabel>
      <InputNumber
        id={id}
        min={1}
        placeholder={t({
          context: 'Input placeholder',
          message: 'Number',
        })}
        value={sequence.number}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}
