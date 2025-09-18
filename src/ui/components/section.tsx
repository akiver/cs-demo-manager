import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  children: ReactNode;
};

export function Section({ title, children }: Props) {
  return (
    <div className="flex flex-col rounded bg-gray-75 p-8">
      <h3 className="text-body-strong">{title}</h3>
      <div className="mt-4 flex h-full flex-col justify-end">{children}</div>
    </div>
  );
}
