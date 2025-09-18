import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Cell({ children }: Props) {
  return (
    <div className="flex h-48 items-center justify-center border-b border-b-gray-300 bg-gray-100 last:border-b-0">
      {children}
    </div>
  );
}
