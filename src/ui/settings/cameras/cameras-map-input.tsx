import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import type { Map } from 'csdm/common/types/map';

type Props = {
  maps: Map[];
  mapName: string;
  onChange: (mapName: string) => void;
};

export function CamerasMapInput({ maps, mapName, onChange }: Props) {
  if (maps.length === 0) {
    return null;
  }

  const mapsOptions = maps.map<SelectOption>(({ name }) => {
    return {
      value: name,
      label: name,
    };
  });

  return (
    <div className="flex items-center gap-x-8">
      <InputLabel>
        <Trans context="Select label">Map</Trans>
      </InputLabel>
      <Select options={mapsOptions} value={mapName} onChange={onChange} />
    </div>
  );
}
