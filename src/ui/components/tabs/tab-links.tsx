import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  children: ReactNode;
};

export function TabLinks({ children }: Props) {
  return (
    <div className="flex border-b border-b-gray-300">
      <div className="flex m-auto px-4 list-none h-40 overflow-auto">{children}</div>
    </div>
  );
}
