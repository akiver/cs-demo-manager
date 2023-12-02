import React from 'react';
import { Trans, msg } from '@lingui/macro';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

export type Axis = 'day' | 'month' | 'year' | 'match';

function useXAxisOptions() {
  const _ = useI18n();

  const options: SelectOption<Axis>[] = [
    {
      label: _(
        msg({
          context: 'Select option time period',
          message: 'Day',
        }),
      ),
      value: 'day',
    },
    {
      label: _(
        msg({
          context: 'Select option time period',
          message: 'Month',
        }),
      ),
      value: 'month',
    },
    {
      label: _(
        msg({
          context: 'Select option time period',
          message: 'Year',
        }),
      ),
      value: 'year',
    },
    {
      label: _(
        msg({
          context: 'Select option time period',
          message: 'Match',
        }),
      ),
      value: 'match',
    },
  ];

  return options;
}

type Props = {
  selectedAxis: Axis;
  onChange: (axis: Axis) => void;
};

export function XAxis({ selectedAxis, onChange }: Props) {
  const options = useXAxisOptions();

  return (
    <div className="flex gap-x-12">
      <InputLabel>
        <Trans context="Input label">X Axis</Trans>
      </InputLabel>
      <Select
        options={options}
        value={selectedAxis}
        onChange={(axis) => {
          onChange(axis);
        }}
      />
    </div>
  );
}
