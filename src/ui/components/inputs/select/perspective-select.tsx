import React from 'react';
import { Trans } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { Perspective } from 'csdm/common/types/perspective';

type Props = {
  onChange: (perspective: Perspective) => void;
  perspective: Perspective;
};

export function PerspectiveSelect({ perspective, onChange }: Props) {
  const options: SelectOption<Perspective>[] = [
    {
      label: <Trans>Player</Trans>,
      value: Perspective.Player,
    },
    {
      label: <Trans>Enemy</Trans>,
      value: Perspective.Enemy,
    },
  ];

  return (
    <div className="flex flex-col gap-y-8">
      <Select
        label={<Trans context="Select label">Point of view</Trans>}
        options={options}
        value={perspective}
        onChange={onChange}
      />
    </div>
  );
}
