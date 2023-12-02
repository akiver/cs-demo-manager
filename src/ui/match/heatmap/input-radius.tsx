import React from 'react';
import { Trans } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useHeatmapContext } from './heatmap-context';

export function HeatmapInputRadius() {
  const { radius, draw } = useHeatmapContext();

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Radius</Trans>
      </InputLabel>
      <input
        type="range"
        min="1"
        max="50"
        value={radius}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          draw({ radius: Number.parseInt(event.target.value) });
        }}
      />
    </div>
  );
}
