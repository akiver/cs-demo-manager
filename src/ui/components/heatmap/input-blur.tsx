import React from 'react';
import { Trans } from '@lingui/react/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useHeatmapContext } from './heatmap-context';

type Props = {
  onChange: (radius: number) => void;
};

export function HeatmapInputBlur({ onChange }: Props) {
  const { blur } = useHeatmapContext();

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Blur</Trans>
      </InputLabel>
      <input
        type="range"
        min="1"
        max="50"
        value={blur}
        onChange={(event) => {
          onChange(Number.parseInt(event.target.value));
        }}
      />
    </div>
  );
}
