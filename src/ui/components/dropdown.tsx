import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { ChevronDown } from 'csdm/ui/icons/chevron-down-icon';
import { Button } from './buttons/button';
import { useOutsideClick } from 'csdm/ui/hooks/use-outside-click';

type Props = {
  togglerContent: ReactNode;
  children: ReactNode;
  isDisabled?: boolean;
};

export function Dropdown({ togglerContent, children, isDisabled = false }: Props) {
  const [isOpened, setIsOpened] = useState(false);
  const content = useOutsideClick<HTMLDivElement>((event) => {
    if (!isOpened) {
      return;
    }
    event.stopPropagation();
    setIsOpened(false);
  });
  const onClick = () => {
    setIsOpened((isOpened) => !isOpened);
  };

  return (
    <div className="relative">
      <Button isDisabled={isDisabled} onClick={onClick}>
        {togglerContent}
        <div className="flex items-center ml-8">
          <ChevronDown width={14} />
        </div>
      </Button>
      <div ref={content}>
        {isOpened && (
          <div className="absolute right-0 mt-8 z-2">
            <div className="flex flex-col bg-gray-75 rounded-8 shadow-[0_0_4px_0_var(--color-gray-500)] overflow-hidden">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
