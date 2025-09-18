import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  children: ReactNode;
};

export function TabLinks({ children }: Props) {
  return (
    <div className="flex border-b border-b-gray-300">
      <div className="m-auto flex h-40 list-none overflow-auto px-4">{children}</div>
    </div>
  );
}
