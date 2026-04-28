import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';

export type Axis = 'day' | 'month' | 'year' | 'match';

function useXAxisOptions() {
  const { t } = useLingui();

  const options: SelectOption<Axis>[] = [
    {
      label: t({
        context: 'Select option time period',
        message: 'Day',
      }),
      value: 'day',
    },
    {
      label: t({
        context: 'Select option time period',
        message: 'Month',
      }),
      value: 'month',
    },
    {
      label: t({
        context: 'Select option time period',
        message: 'Year',
      }),
      value: 'year',
    },
    {
      label: t({
        context: 'Select option time period',
        message: 'Match',
      }),
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
    <div className="flex items-center gap-x-12">
      <Select
        label={<Trans context="Input label">X Axis</Trans>}
        options={options}
        value={selectedAxis}
        onChange={(axis) => {
          onChange(axis);
        }}
      />
    </div>
  );
}
