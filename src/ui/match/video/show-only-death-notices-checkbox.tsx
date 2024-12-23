import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';

type Props = {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

export function ShowOnlyDeathNoticesCheckbox({ isChecked, onChange }: Props) {
  return (
    <Checkbox
      label={<Trans context="Input label">Show only death notices</Trans>}
      isChecked={isChecked}
      onChange={(event) => {
        onChange(event.target.checked);
      }}
    />
  );
}
