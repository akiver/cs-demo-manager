import { ChevronDown } from 'csdm/ui/icons/chevron-down-icon';
import React, { useRef } from 'react';
import type { ReactNode } from 'react';

type Props = {
  label: ReactNode;
  children: ReactNode;
};

export function SubContextMenu({ label, children }: Props) {
  const subMenuRef = useRef<HTMLDivElement | null>(null);
  const leaveTimeout = useRef(-1);

  const onMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const subMenu = subMenuRef.current;
    clearTimeout(leaveTimeout.current);

    if (!subMenu || !(event.target instanceof HTMLDivElement)) {
      return;
    }

    subMenu.classList.remove('hidden');

    const menuItemRect = event.target.getBoundingClientRect();
    const subMenuRect = subMenu.getBoundingClientRect();
    let x = menuItemRect.width;
    let y = 0;

    const isOverlappingOnTheRight = menuItemRect.right + subMenuRect.width > window.innerWidth;
    if (isOverlappingOnTheRight) {
      x = -subMenuRect.width;
    }

    const isOverlappingAtTheBottom = window.innerHeight - menuItemRect.bottom < subMenuRect.height;
    if (isOverlappingAtTheBottom) {
      y = -(subMenuRect.height - menuItemRect.height);
    }

    subMenu.setAttribute('style', `left: ${x}px; top:${y}px;`);
  };

  const onMouseLeave = () => {
    leaveTimeout.current = window.setTimeout(() => {
      if (!subMenuRef.current) {
        return;
      }

      subMenuRef.current.classList.add('hidden');
    }, 100);
  };

  return (
    <div
      className={`relative flex items-center h-32 leading-none px-16 min-w-[224px] hover:bg-gray-300`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between items-center flex-1">
        <span>{label}</span>
        <ChevronDown width={12} height={12} className="-rotate-90" />
      </div>
      <div ref={subMenuRef} className="absolute top-0 hidden">
        <div className="bg-gray-100 p-8 rounded shadow-[0_0_4px_0_var(--color-gray-500)]">{children}</div>
      </div>
    </div>
  );
}
