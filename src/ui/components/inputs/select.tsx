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
      className="h-[30px] bg-gray-50 border border-gray-400 rounded disabled:bg-gray-400 enabled:hover:border-gray-900 focus:border-gray-900 outline-hidden pl-12 appearance-none"
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
