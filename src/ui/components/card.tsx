import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Card({ children }: Props) {
  return <div className="flex flex-col min-w-[152px] border border-gray-300 bg-gray-75 rounded p-8">{children}</div>;
}
