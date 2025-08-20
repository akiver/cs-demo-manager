import React, { type ReactNode } from 'react';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';

type Props = {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
};

export function RangeInput({ label, value, onChange, min, max, step }: Props) {
  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>{label}</InputLabel>
      <input
        type="range"
        min={min}
        step={step}
        max={max}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
      />
    </div>
  );
}
