import React from 'react';

export type SelectOption<ValueType extends string | number = string> = {
  value: ValueType;
  label: React.ReactNode;
};

type Props<ValueType extends string | number = string> = {
  id?: string;
  isDisabled?: boolean;
  options: SelectOption<ValueType>[];
  value?: ValueType;
  onChange: (value: ValueType) => void;
};

export function Select<ValueType extends string | number = string>({
  options,
  value,
  onChange,
  isDisabled = false,
  id,
}: Props<ValueType>) {
  return (
    <select
      id={id}
      className="h-[30px] appearance-none rounded border border-gray-400 bg-gray-50 pl-12 outline-hidden focus:border-gray-900 enabled:hover:border-gray-900 disabled:bg-gray-400"
      disabled={isDisabled}
      value={value}
      onChange={(event) => {
        onChange(event.target.value as ValueType);
      }}
    >
      {options.map((option) => {
        return (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
}
