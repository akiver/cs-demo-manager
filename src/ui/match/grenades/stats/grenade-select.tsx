import React from 'react';
import { useLingui } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { GrenadeOption } from 'csdm/ui/match/grenades/stats/grenade-option';

type Props = {
  onChange: (grenade: GrenadeOption) => void;
  selectedGrenade: GrenadeOption;
};

export function GrenadeSelect({ onChange, selectedGrenade }: Props) {
  const { t } = useLingui();

  const options: SelectOption<GrenadeOption>[] = [
    {
      label: t({
        context: 'Grenade name',
        message: 'Flashbang',
      }),
      value: GrenadeOption.Flashbang,
    },
    {
      label: t({
        context: 'Grenade name',
        message: 'HE Grenade',
      }),
      value: GrenadeOption.HE,
    },
    {
      label: t({
        context: 'Grenade name',
        message: 'Fire',
      }),
      value: GrenadeOption.Fire,
    },
    {
      label: t({
        context: 'Grenade name',
        message: 'Smoke',
      }),
      value: GrenadeOption.Smoke,
    },
  ];

  const handleChange = (grenadeName: GrenadeOption) => {
    onChange(grenadeName);
  };

  return <Select options={options} value={selectedGrenade} onChange={handleChange} />;
}
