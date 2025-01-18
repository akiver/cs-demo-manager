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
      className="relative w-40 h-20 bg-gray-300 checked:bg-blue-700 rounded-full cursor-pointer appearance-none before:inline-block before:size-12 before:bg-gray-100 checked:before:bg-gray-50 before:translate-x-4 checked:before:translate-x-24 before:rounded-full before:duration-300"
    />
  );
}
