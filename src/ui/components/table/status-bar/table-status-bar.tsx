import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  children: ReactNode;
};

export function TableStatusBar({ children }: Props) {
  return (
    <div className="mt-auto p-8 bg-gray-50 w-full border-t border-t-gray-300">
      <div className="flex items-center justify-end">{children}</div>
    </div>
  );
}
