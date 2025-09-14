import React from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  onClick: () => void;
  variant?: 'danger' | 'default';
};

export function Control({ children, onClick, variant }: Props) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center w-48 h-full',
        variant === 'danger' ? 'hover:bg-[#c42b1c]' : 'hover:bg-gray-300',
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
