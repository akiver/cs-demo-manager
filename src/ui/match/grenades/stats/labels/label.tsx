import React, { type ReactNode } from 'react';

type Props = {
  text: ReactNode;
};

export function StatLabel({ text }: Props) {
  return (
    <div className="flex h-48 items-center justify-center bg-gray-75 whitespace-nowrap">
      <p>{text}</p>
    </div>
  );
}
