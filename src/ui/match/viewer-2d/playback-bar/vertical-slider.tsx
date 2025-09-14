import React from 'react';

type Props = {
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
};

export function VerticalSlider({ value, onChange, min, max, step }: Props) {
  return (
    <div className="flex h-[120px] w-40 items-center justify-center bg-gray-100 py-8">
      <input
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="h-full w-12 appearance-v-slider focus-visible:outline-none"
      />
    </div>
  );
}
