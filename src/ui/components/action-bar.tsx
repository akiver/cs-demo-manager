import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  left?: ReactNode;
  right?: ReactNode;
};

export function ActionBar({ left, right }: Props) {
  return (
    <div className="flex items-center p-8 border-b border-b-gray-300 flex-wrap">
      <div className="flex items-center flex-1 gap-8 flex-wrap">{left}</div>
      <div className="flex items-center gap-8 flex-wrap">{right}</div>
    </div>
  );
}
