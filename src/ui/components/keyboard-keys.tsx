import React, { type ReactNode } from 'react';

type Props = {
  children: string;
};

export function KeyboardKey({ children }: Props) {
  return (
    <div className="flex items-center justify-center rounded-4 border border-gray-400 bg-gray-50 px-8 py-4 text-caption font-bold">
      <p>{children}</p>
    </div>
  );
}

export function KeyboardKeys({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-x-4">{children}</div>;
}
