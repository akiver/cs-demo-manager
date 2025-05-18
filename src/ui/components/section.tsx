import React from 'react';
import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  children: ReactNode;
};

export function Section({ title, children }: Props) {
  return (
    <div className="flex flex-col bg-gray-75 rounded p-8">
      <h3 className="text-body-strong">{title}</h3>
      <div className="flex flex-col h-full justify-end mt-4">{children}</div>
    </div>
  );
}
