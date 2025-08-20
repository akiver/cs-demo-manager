import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useHeatmapContext } from './heatmap-context';
import { RangeInput } from '../inputs/range-input';

type Props = {
  onChange: (blur: number) => void;
};

export function HeatmapInputBlur({ onChange }: Props) {
  const { blur } = useHeatmapContext();

  return (
    <RangeInput label={<Trans context="Input label">Blur</Trans>} value={blur} onChange={onChange} min={1} max={50} />
  );
}
