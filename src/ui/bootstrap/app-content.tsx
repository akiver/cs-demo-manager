import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function AppContent({ children }: Props) {
  return <div className="flex w-full flex-1 flex-col overflow-hidden bg-gray-50">{children}</div>;
}
