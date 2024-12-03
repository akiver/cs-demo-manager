import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Checkbox } from 'csdm/ui/components/inputs/checkbox';

type Props = {
  defaultChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

export function XRayCheckbox({ defaultChecked, onChange }: Props) {
  return (
    <Checkbox
      label={<Trans context="Checkbox label">Show X-Ray</Trans>}
      defaultChecked={defaultChecked}
      onChange={(event) => {
        onChange(event.target.checked);
      }}
    />
  );
}
