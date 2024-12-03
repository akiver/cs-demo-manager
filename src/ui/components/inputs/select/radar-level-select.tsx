import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { Game } from 'csdm/common/types/counter-strike';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { useGetMapRadarSrc } from 'csdm/ui/maps/use-get-map-radar-src';

type Props = {
  onChange: (radarLevel: RadarLevel) => void;
  selectedRadarLevel: RadarLevel;
  mapName: string;
  game: Game;
};

export function RadarLevelSelect({ onChange, selectedRadarLevel, mapName, game }: Props) {
  const getMapRadarLowerSrc = useGetMapRadarSrc();
  const mapRadarLowerSrc = getMapRadarLowerSrc(mapName, game, RadarLevel.Lower);

  if (mapRadarLowerSrc === undefined) {
    return null;
  }

  const options: SelectOption<RadarLevel>[] = [
    {
      label: <Trans>Upper</Trans>,
      value: RadarLevel.Upper,
    },
    {
      label: <Trans>Lower</Trans>,
      value: RadarLevel.Lower,
    },
  ];

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans>Radar level</Trans>
      </InputLabel>
      <Select
        options={options}
        value={selectedRadarLevel}
        onChange={(selectedRadarLevel) => {
          onChange(selectedRadarLevel);
        }}
      />
    </div>
  );
}
