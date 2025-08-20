import React from 'react';
import { useHeatmapContext } from './heatmap-context';
import { OpacityInput } from '../inputs/opacity-input';

type Props = {
  onChange: (alpha: number) => void;
};

export function HeatmapInputOpacity({ onChange }: Props) {
  const { alpha } = useHeatmapContext();

  return <OpacityInput value={alpha} onChange={onChange} />;
}
