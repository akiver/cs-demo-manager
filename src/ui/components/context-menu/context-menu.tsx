import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  children: ReactNode;
};

export function ContextMenu({ children }: Props) {
  return <div className="rounded-8 bg-gray-100 p-4 shadow-[0_0_4px_0_var(--color-gray-500)]">{children}</div>;
}
