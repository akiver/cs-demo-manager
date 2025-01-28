import React, { type ReactNode } from 'react';
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
      className={`py-8 duration-85 transition-all text-body-strong text-gray-900 text-left hover:opacity-100 no-underline cursor-pointer ${
        isActive ? 'opacity-100' : 'opacity-50'
      }`}
      onClick={onClick}
    >
      <p>{children}</p>
    </button>
  );
}
