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
    <div className="flex items-center justify-center py-8 bg-gray-100 w-40 h-[120px]">
      <input
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-12 h-full appearance-v-slider focus-visible:outline-none"
      />
    </div>
  );
}
