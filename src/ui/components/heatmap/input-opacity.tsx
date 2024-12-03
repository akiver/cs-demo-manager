import React from 'react';
import { Trans } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useHeatmapContext } from './heatmap-context';

type Props = {
  onChange: (radius: number) => void;
};

export function HeatmapInputOpacity({ onChange }: Props) {
  const { alpha } = useHeatmapContext();

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Opacity</Trans>
      </InputLabel>
      <input
        type="range"
        min="0"
        step={0.1}
        max="1"
        value={alpha}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
      />
    </div>
  );
}
