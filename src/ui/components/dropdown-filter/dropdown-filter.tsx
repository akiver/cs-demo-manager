import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from 'csdm/ui/components/buttons/button';
import { ChevronDown } from 'csdm/ui/icons/chevron-down-icon';
import { useOutsideClick } from 'csdm/ui/hooks/use-outside-click';
import { ActiveFilterIndicator } from 'csdm/ui/components/dropdown-filter/active-filter-indicator';

type Props = {
  children: ReactNode;
  isDisabled?: boolean;
  hasActiveFilter: boolean;
};

export function DropdownFilter({ children, isDisabled, hasActiveFilter }: Props) {
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
      <Button onClick={onClick} isDisabled={isDisabled}>
        <div className="flex items-center">
          <span>
            <Trans context="Button">Filters</Trans>
          </span>
          <ChevronDown width={14} className="ml-8" />
        </div>
        {hasActiveFilter && (
          <div className="absolute bottom-4 right-4">
            <ActiveFilterIndicator />
          </div>
        )}
      </Button>
      <div ref={content}>
        {isOpened && (
          <div className="absolute right-0 mt-8 z-2">
            <div className="flex flex-col w-full bg-gray-75 rounded-8 shadow-[0_0_4px_0_var(--color-gray-500)] max-h-[calc(100vh-var(--title-bar-height)-58px)] overflow-auto">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
