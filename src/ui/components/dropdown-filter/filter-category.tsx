import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  name: ReactNode;
  children: ReactNode;
  right?: ReactNode;
};

export function FilterCategory({ name, children, right }: Props) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex justify-between">
        <p>{name}</p>
        {right}
      </div>
      <div className="flex max-h-[150px] flex-wrap gap-x-8 gap-y-4 overflow-auto py-4">{children}</div>
    </div>
  );
}
