import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useHeatmapContext } from './heatmap-context';
import { RangeInput } from '../inputs/range-input';

type Props = {
  onChange: (radius: number) => void;
};

export function HeatmapInputRadius({ onChange }: Props) {
  const { radius } = useHeatmapContext();

  return (
    <RangeInput
      label={<Trans context="Input label">Radius</Trans>}
      value={radius}
      onChange={onChange}
      min={1}
      max={50}
    />
  );
}
