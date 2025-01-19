import React, { useId, type ReactNode } from 'react';
import { InputLabel } from './input-label';
import { InputNumber } from './number-input';

type Props = {
  label: ReactNode;
  defaultValue: number;
  onChange: (value: number) => void;
};

export function SecondsInput({ label, defaultValue, onChange }: Props) {
  const id = useId();
  const min = 0;
  const max = 30;

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <div className="w-[5rem]">
        <InputNumber
          id={id}
          min={min}
          max={max}
          placeholder={String(2)}
          defaultValue={defaultValue}
          onChange={(event) => {
            if (!(event.target instanceof HTMLInputElement)) {
              return;
            }

            const value = Number(event.target.value);
            if (value >= min && value <= max) {
              onChange(value);
            }
          }}
        />
      </div>
    </div>
  );
}
