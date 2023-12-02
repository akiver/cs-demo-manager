import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { GrenadeName } from 'csdm/common/types/counter-strike';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { grenadeNameChanged } from 'csdm/ui/match/grenades/finder/grenades-finder-actions';
import { useSelectedGrenadeName } from 'csdm/ui/match/grenades/finder/use-selected-grenade-name';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export function GrenadeNameSelect() {
  const dispatch = useDispatch();
  const selectedGrenadeName = useSelectedGrenadeName();
  const _ = useI18n();

  const options: SelectOption<GrenadeName>[] = [
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'Smoke',
        }),
      ),
      value: GrenadeName.Smoke,
    },
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'Flashbang',
        }),
      ),
      value: GrenadeName.Flashbang,
    },
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'HE Grenade',
        }),
      ),
      value: GrenadeName.HE,
    },
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'Decoy',
        }),
      ),
      value: GrenadeName.Decoy,
    },
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'Molotov',
        }),
      ),
      value: GrenadeName.Molotov,
    },
    {
      label: _(
        msg({
          context: 'Grenade name',
          message: 'Incendiary',
        }),
      ),
      value: GrenadeName.Incendiary,
    },
  ];

  const onChange = (grenadeName: GrenadeName) => {
    dispatch(grenadeNameChanged({ grenadeName }));
  };

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>
        <Trans context="Input label">Grenade</Trans>
      </InputLabel>
      <Select onChange={onChange} options={options} value={selectedGrenadeName} />
    </div>
  );
}
