import React, { type ReactNode } from 'react';
import { Radio, RadioGroup } from './radio-group';
import { Trans } from '@lingui/react/macro';
import { TriStateFilter } from 'csdm/common/types/tri-state-filter';

type Props = {
  label: ReactNode;
  value: TriStateFilter;
  onChange: (value: TriStateFilter) => void;
};

export function RadioGroupTriState({ label, value, onChange }: Props) {
  return (
    <RadioGroup<TriStateFilter> label={label} value={value} onChange={onChange}>
      <Radio value={TriStateFilter.All}>
        <Trans>All</Trans>
      </Radio>
      <Radio value={TriStateFilter.Yes}>
        <Trans>Yes</Trans>
      </Radio>
      <Radio value={TriStateFilter.No}>
        <Trans>No</Trans>
      </Radio>
    </RadioGroup>
  );
}
