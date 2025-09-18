import React from 'react';

type Props = {
  id?: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

export function Switch({ id, isChecked, onChange }: Props) {
  return (
    <input
      type="checkbox"
      id={id}
      onChange={(event) => onChange(event.target.checked)}
      checked={isChecked}
      className="relative h-20 w-40 cursor-pointer appearance-none rounded-full bg-gray-300 before:inline-block before:size-12 before:translate-x-4 before:rounded-full before:bg-gray-100 before:duration-300 checked:bg-blue-700 checked:before:translate-x-24 checked:before:bg-gray-50"
    />
  );
}
