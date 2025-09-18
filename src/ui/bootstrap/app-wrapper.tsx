import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function AppWrapper({ children }: Props) {
  return <div className="flex h-[calc(100vh-var(--title-bar-height))] overflow-hidden">{children}</div>;
}
