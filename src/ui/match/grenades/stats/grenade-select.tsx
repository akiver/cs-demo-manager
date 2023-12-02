import React from 'react';
import { msg } from '@lingui/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { GrenadeOption } from 'csdm/ui/match/grenades/stats/grenade-option';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  onChange: (grenade: GrenadeOption) => void;
  selectedGrenade: GrenadeOption;
};

export function GrenadeSelect({ onChange, selectedGrenade }: Props) {
  const _ = useI18n();

  const options: SelectOption<GrenadeOption>[] = [
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'Flashbang',
        }),
      ),
      value: GrenadeOption.Flashbang,
    },
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'HE Grenade',
        }),
      ),
      value: GrenadeOption.HE,
    },
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'Fire',
        }),
      ),
      value: GrenadeOption.Fire,
    },
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'Smoke',
        }),
      ),
      value: GrenadeOption.Smoke,
    },
  ];

  const handleChange = (grenadeName: GrenadeOption) => {
    onChange(grenadeName);
  };

  return <Select options={options} value={selectedGrenade} onChange={handleChange} />;
}
