import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Content({ children }: Props) {
  return <div className="flex flex-1 flex-col overflow-y-auto p-16">{children}</div>;
}

export function CenteredContent({ children }: Props) {
  return <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-16">{children}</div>;
}
