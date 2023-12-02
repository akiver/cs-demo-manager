import React, { type ReactNode } from 'react';

type Props = {
  text: ReactNode;
};

export function StatLabel({ text }: Props) {
  return (
    <div className="flex items-center justify-center h-48 bg-gray-75 whitespace-nowrap">
      <p>{text}</p>
    </div>
  );
}
