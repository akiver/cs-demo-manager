import React from 'react';
import { Trans } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { InputNumber } from 'csdm/ui/components/inputs/number-input';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { useSequenceForm } from './use-sequence-form';

export function EndTickInput() {
  const match = useCurrentMatch();
  const { sequence, updateSequence } = useSequenceForm();

  const onBlur = (event: React.FocusEvent) => {
    const input = event.target as HTMLInputElement;
    if (Number.isNaN(Number.parseInt(input.value))) {
      const roundedTickrate = Math.round(match.tickrate);
      const newEndTick = Number(sequence.startTick) + roundedTickrate;
      updateSequence({
        endTick: String(newEndTick),
      });
    }
  };

  const onChange = (event: React.ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    updateSequence({
      endTick: input.value,
    });
  };

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor="end-tick">
        <Trans context="Input label">End tick</Trans>
      </InputLabel>
      <InputNumber
        id="end-tick"
        min={1}
        placeholder="End tick"
        value={sequence.endTick}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}
