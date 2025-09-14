import React from 'react';
import type { ReactNode, Ref } from 'react';

type Props = {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
  onClick?: () => void;
  isDisabled?: boolean | undefined;
};

export function PlaybackBarButton({ children, ref, onClick, isDisabled }: Props) {
  return (
    <button
      ref={ref}
      className="flex min-w-40 cursor-pointer items-center justify-center border-r border-r-gray-300 bg-gray-50 p-8 text-gray-900 transition-all duration-85 last:border-r-0 hover:enabled:bg-gray-100 disabled:opacity-50"
      onClick={onClick}
      disabled={isDisabled}
    >
      <div>{children}</div>
    </button>
  );
}
