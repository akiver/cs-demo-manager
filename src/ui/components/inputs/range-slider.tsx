import React, { type ReactNode } from 'react';
import { Slider } from '@base-ui/react/slider';
import { InputLabel } from 'csdm/ui/components/inputs/input-label';
import { Tooltip } from 'csdm/ui/components/tooltip';

export type RangeSliderValue = [number, number];

export type RangeSliderMark = {
  value: number;
  label: ReactNode;
};

type Props = {
  label: ReactNode;
  min: number;
  max: number;
  step?: number;
  value: RangeSliderValue;
  onValueChange: (value: RangeSliderValue) => void; // Called while dragging a thumb
  onValueCommitted: (value: RangeSliderValue) => void; // Called when a thumb has been released
  formatValue?: (value: number) => string;
  marks?: RangeSliderMark[]; // Points of interest displayed on the track
};

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onValueChange,
  onValueCommitted,
  formatValue = String,
  marks = [],
}: Props) {
  const [start, end] = value;

  return (
    <div className="flex flex-col gap-y-8">
      <InputLabel>{label}</InputLabel>
      <Slider.Root
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(newValue) => {
          onValueChange(newValue as RangeSliderValue);
        }}
        onValueCommitted={(newValue) => {
          onValueCommitted(newValue as RangeSliderValue);
        }}
      >
        <div className="flex items-center justify-between text-caption text-gray-600">
          <span>{formatValue(start)}</span>
          <span>{formatValue(end)}</span>
        </div>
        <Slider.Control className="flex w-full touch-none items-center py-8 select-none">
          <Slider.Track className="relative h-4 w-full rounded-full bg-gray-300 select-none">
            <Slider.Indicator className="rounded-full bg-blue-600 select-none" />
            {marks.map((mark) => {
              const percent = ((mark.value - min) / (max - min)) * 100;
              return (
                <Tooltip key={mark.value} content={mark.label} placement="top">
                  <div
                    className="absolute top-1/2 h-12 w-4 -translate-1/2 rounded-full bg-orange-600"
                    style={{ left: `${percent}%` }}
                  />
                </Tooltip>
              );
            })}
            {[0, 1].map((index) => {
              return (
                <Slider.Thumb
                  key={index}
                  index={index}
                  className="size-16 rounded-full border-2 border-blue-600 bg-gray-50 select-none has-focus-visible:border-gray-900"
                />
              );
            })}
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
