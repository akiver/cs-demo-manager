import React, { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Card({ children }: Props) {
  return <div className="flex min-w-[152px] flex-col rounded border border-gray-300 bg-gray-75 p-8">{children}</div>;
}
