import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import type { SettingsCategory } from './settings-category';
import { useSettingsOverlay } from './use-settings-overlay';

type Props = {
  children: ReactNode;
  category: SettingsCategory;
};

export function SettingsCategoryButton({ children, category }: Props) {
  const { category: currentCategory, showCategory } = useSettingsOverlay();

  const onClick = () => {
    showCategory(category);
  };
  const isActive = currentCategory === category;

  return (
    <button
      className={clsx(
        'cursor-pointer py-8 text-left text-body-strong text-gray-900 no-underline transition-all duration-85 hover:opacity-100',
        isActive ? 'opacity-100' : 'opacity-50',
      )}
      onClick={onClick}
    >
      <p>{children}</p>
    </button>
  );
}
