import React from 'react';
import { Trans } from '@lingui/react/macro';
import { RangeInput } from './range-input';

type Props = {
  value: number;
  onChange: (alpha: number) => void;
};

export function OpacityInput({ value, onChange }: Props) {
  return (
    <RangeInput
      label={<Trans context="Input label">Opacity</Trans>}
      value={value}
      onChange={onChange}
      min={0}
      step={0.1}
      max={1}
    />
  );
}
