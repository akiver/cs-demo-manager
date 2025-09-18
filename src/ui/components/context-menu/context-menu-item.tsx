import type { ReactNode } from 'react';
import React from 'react';
import clsx from 'clsx';
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
      className={clsx(
        'flex h-32 min-w-[224px] items-center rounded px-16 leading-none select-none hover:bg-gray-200',
        isDisabled ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100 hover:text-gray-900',
      )}
      onClick={handleClick}
    >
      <div className="flex flex-1 items-center justify-between">{children}</div>
    </div>
  );
}
