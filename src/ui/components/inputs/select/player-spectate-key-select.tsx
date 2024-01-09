import React from 'react';
import { Select, type SelectOption } from '../select';

type Props = {
  id?: string;
  isDisabled?: boolean;
  value: number;
  onChange: (value: number) => void;
};

export function PlayerSpectateKeySelect({ id, onChange, value, isDisabled }: Props) {
  const options: SelectOption<number>[] = Array.from({ length: 10 })
    .fill(0)
    .map((value, index) => {
      return {
        label: index.toString(),
        value: index,
      };
    });

  return <Select id={id} options={options} value={value} onChange={onChange} isDisabled={isDisabled} />;
}
