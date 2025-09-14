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
        className="flex size-28 items-center justify-center rounded text-gray-900 hover:bg-gray-300 aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-transparent"
        onClick={isDisabled ? undefined : onClick}
        aria-disabled={isDisabled}
      >
        {children}
      </button>
    </Tooltip>
  );
}
