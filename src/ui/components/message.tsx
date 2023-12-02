import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  message: ReactNode;
};

export function Message({ message }: Props) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-subtitle">{message}</p>
    </div>
  );
}
