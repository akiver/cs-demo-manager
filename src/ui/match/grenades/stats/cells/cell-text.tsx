import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function CellText({ children }: Props) {
  return <p className="selectable text-body-strong">{children}</p>;
}
