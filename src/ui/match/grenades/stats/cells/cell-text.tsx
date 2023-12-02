import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function CellText({ children }: Props) {
  return <p className="text-body-strong selectable">{children}</p>;
}
