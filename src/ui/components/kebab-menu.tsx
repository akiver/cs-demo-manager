import React, { useState, type ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';
import { EllipsisVerticalIcon } from '../icons/ellipsis-vertical-icon';
import { Menu, MenuContent, MenuTrigger, type Placement } from './menu';

type Props = {
  children: ReactNode;
  placement?: Placement;
};

export function KebabMenu({ children, placement = 'bottom' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLingui();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Menu open={isOpen} onOpenChange={toggleMenu} placement={placement}>
      <MenuTrigger
        className="flex h-full w-24 cursor-pointer items-center justify-center transition-colors duration-200 hover:text-gray-900"
        onClick={toggleMenu}
        aria-label={isOpen ? t`Close menu` : t`Open menu`}
      >
        <EllipsisVerticalIcon className="h-full" />
      </MenuTrigger>

      <MenuContent>{children}</MenuContent>
    </Menu>
  );
}
