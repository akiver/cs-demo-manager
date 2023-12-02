import type { ReactNode } from 'react';
import React from 'react';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';

type Props = {
  children: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
};

export function ContextMenuItem({ onClick, children, isDisabled }: Props) {
  const contextMenu = useContextMenu();

  const handleClick = () => {
    onClick();
    contextMenu.hideContextMenu();
  };

  return (
    <div
      className={`flex items-center leading-none h-32 px-16 min-w-[224px] hover:bg-gray-200 select-none rounded ${
        isDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100 pointer-events-auto hover:text-gray-900'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center flex-1">{children}</div>
    </div>
  );
}
