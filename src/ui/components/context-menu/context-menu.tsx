import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  children: ReactNode;
};

export function ContextMenu({ children }: Props) {
  return <div className="bg-gray-100 p-4 rounded-8 shadow-[0_0_4px_0_var(--color-gray-500)]">{children}</div>;
}
