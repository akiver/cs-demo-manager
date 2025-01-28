import React from 'react';
import { BarsIcon } from 'csdm/ui/icons/bars-icon';

export function MenuButton() {
  return (
    <button
      className="flex items-center justify-center w-48 cursor-default h-full no-drag hover:bg-gray-300 outline-hidden"
      onClick={() => {
        window.csdm.showTitleBarMenu();
      }}
    >
      <BarsIcon width={12} />
    </button>
  );
}
