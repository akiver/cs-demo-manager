import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Content({ children }: Props) {
  return <div className="flex flex-col flex-1 p-16 overflow-y-auto">{children}</div>;
}

export function CenteredContent({ children }: Props) {
  return <div className="flex flex-col flex-1 p-16 overflow-y-auto items-center justify-center">{children}</div>;
}
