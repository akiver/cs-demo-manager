import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function AppContent({ children }: Props) {
  return <div className="flex flex-col flex-1 w-full bg-gray-50 overflow-hidden">{children}</div>;
}
