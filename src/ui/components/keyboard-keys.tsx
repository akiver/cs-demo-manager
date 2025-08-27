import React, { type ReactNode } from 'react';

type Props = {
  children: string;
};

export function KeyboardKey({ children }: Props) {
  return (
    <div className="flex items-center justify-center bg-gray-50 border border-gray-400 text-caption font-bold rounded-4 py-4 px-8">
      <p>{children}</p>
    </div>
  );
}

export function KeyboardKeys({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-x-4">{children}</div>;
}
