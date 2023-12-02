import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Cell({ children }: Props) {
  return (
    <div className="flex items-center justify-center h-48 bg-gray-100 border-b border-b-gray-300 last:border-b-0">
      {children}
    </div>
  );
}
