import React from 'react';
import { Trans } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { useHeatmapContext } from './heatmap-context';

export function HeatmapInputBlur() {
  const { blur, draw } = useHeatmapContext();

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
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          draw({ blur: Number.parseInt(event.target.value) });
        }}
      />
    </div>
  );
}
