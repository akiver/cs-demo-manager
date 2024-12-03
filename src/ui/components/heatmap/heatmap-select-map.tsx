import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useHeatmapContext } from 'csdm/ui/components/heatmap/heatmap-context';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';

type Props = {
  mapNames: string[];
};

export function HeatmapSelectMap({ mapNames }: Props) {
  const { mapName, fetchPoints } = useHeatmapContext();
  const options = mapNames.map<SelectOption>((mapName) => {
    return {
      value: mapName,
      label: mapName,
    };
  });

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Map</Trans>
      </InputLabel>
      <Select
        options={options}
        value={mapName}
        onChange={(mapName) => {
          fetchPoints({ mapName });
        }}
      />
    </div>
  );
}
