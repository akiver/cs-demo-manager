import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function LeftBarBadge({ children }: Props) {
  return <div className="absolute -top-8 -right-8">{children}</div>;
}
