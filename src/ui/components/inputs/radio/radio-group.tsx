import React, { useId, type ReactNode } from 'react';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';

type RadioProps = {
  value: string;
  children: ReactNode;
};

export function Radio({ value, children }: RadioProps) {
  return (
    <label>
      <BaseRadio.Root
        value={value}
        className="m-0 flex size-16 items-center justify-center rounded-full p-0 outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 data-checked:bg-gray-900 data-unchecked:border data-unchecked:border-gray-700 data-unchecked:bg-transparent"
      >
        <BaseRadio.Indicator className="flex items-center justify-center before:h-8 before:w-8 before:rounded-full before:bg-gray-50 before:content-[''] data-unchecked:hidden" />
      </BaseRadio.Root>
      {children}
    </label>
  );
}

type Props<DataType = string> = {
  label: ReactNode;
  children: ReactNode;
  value: DataType;
  onChange: (value: DataType) => void;
};

export function RadioGroup<DataType = string>({ label, children, value, onChange }: Props<DataType>) {
  const id = useId();

  return (
    <BaseRadioGroup
      aria-labelledby={id}
      className="flex flex-col gap-y-8"
      value={value}
      onValueChange={(value) => {
        if (typeof value === 'string') {
          onChange(value as DataType);
        }
      }}
    >
      <div id={id}>{label}</div>
      <div className="flex gap-16">{children}</div>
    </BaseRadioGroup>
  );
}
