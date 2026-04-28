import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';
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
      <Select
        label={<Trans context="Select label">Map</Trans>}
        options={mapsOptions}
        value={mapName}
        onChange={onChange}
      />
    </div>
  );
}
