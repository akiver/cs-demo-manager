import React from 'react';
import type { ReactNode, Ref } from 'react';

type Props = {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isDisabled?: boolean | undefined;
};

export function PlaybackBarButton({ children, ref, onClick, isDisabled, onMouseEnter, onMouseLeave }: Props) {
  return (
    <button
      ref={ref}
      className="flex items-center justify-center flex-none w-40 p-12 bg-gray-50 text-gray-900 border-r border-r-gray-300 last:border-r-0 duration-85 transition-all cursor-pointer disabled:opacity-50 hover:enabled:bg-gray-100"
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </button>
  );
}
