import React, { type ReactNode } from 'react';
import { Tooltip } from 'csdm/ui/components/tooltip';

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  isDisabled: boolean;
  tooltip: ReactNode;
};

export function HistoryButton({ children, onClick, isDisabled, tooltip }: Props) {
  return (
    <Tooltip content={tooltip}>
      <button
        className="flex items-center justify-center size-28 rounded hover:bg-gray-300 text-gray-900 aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent"
        onClick={isDisabled ? undefined : onClick}
        aria-disabled={isDisabled}
      >
        {children}
      </button>
    </Tooltip>
  );
}
