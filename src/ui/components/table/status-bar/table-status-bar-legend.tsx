import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  text: string | ReactNode;
  rectangle: ReactNode;
};

export function TableStatusBarLegend({ text, rectangle }: Props) {
  return (
    <div className="flex items-center">
      {rectangle}
      <p className="ml-4 selectable">{text}</p>
    </div>
  );
}
