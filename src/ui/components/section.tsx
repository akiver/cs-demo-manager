import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
};

export function Section({ title, icon, children }: Props) {
  return (
    <div className="flex flex-col bg-gray-75 rounded p-8">
      {
        <div className="flex items-center gap-x-4">
          <h3 className="text-body-strong">{title}</h3>
          {icon}
        </div>
      }
      {<div className="flex flex-col h-full justify-end mt-4">{children}</div>}
    </div>
  );
}
