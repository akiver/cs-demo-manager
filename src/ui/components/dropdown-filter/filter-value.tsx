import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  isSelected: boolean;
  children: ReactNode;
  onClick: () => void;
};

export function FilterValue({ isSelected, onClick, children }: Props) {
  return (
    <button
      className={`flex items-center justify-center min-w-32 px-8 py-4 border rounded hover:text-gray-900 select-none text-caption cursor-default ${
        isSelected
          ? 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-400'
          : 'bg-gray-200 text-gray-600 border-transparent'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
